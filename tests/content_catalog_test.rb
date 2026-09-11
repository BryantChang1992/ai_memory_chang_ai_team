require 'jekyll'
require 'minitest/autorun'
require 'nokogiri'
require 'json'
require 'uri'
require_relative '../_plugins/content_catalog'

class ContentCatalogTest < Minitest::Test
  def setup
    @site = Jekyll::Site.new(Jekyll.configuration('quiet' => true))
    @site.reset
    @site.read
    @catalog = ContentCatalog.build(@site)
    @destination = ENV.fetch('SITE_DESTINATION', '_site')
  end

  def page(path)
    Nokogiri::HTML(File.read(File.join(@destination, path)))
  end

  def urls(nodes)
    nodes.map { |node| URI::DEFAULT_PARSER.unescape(node['href']).delete_prefix(@site.config.fetch('baseurl', '')) }
  end

  def test_revised_week_nine_does_not_displace_week_ten
    post_class = Struct.new(:data, :date, :url, :content)
    nine = post_class.new({ 'content_type' => '周报', 'issue' => 9 }, Time.new(2026, 7, 12), '/week-09/', '')
    ten = post_class.new({ 'content_type' => '周报', 'issue' => 10 }, Time.new(2026, 7, 9), '/week-10/', '')
    fixture = Struct.new(:posts, :data).new(Struct.new(:docs).new([ten, nine]), @site.data)
    assert_equal [10, 9], ContentCatalog.build(fixture)['weekly'].map { |issue| issue['overview'].data['issue'] }
    @catalog['weekly'].each do |issue|
      links = issue['reports'].map { |report| report['url'] }
      assert_equal links.uniq, links
      refute links.any? { |url| url.include?('conferences-doris') || url.include?('wiki_synthesis/week_06') }
    end
  end

  def test_each_report_has_exactly_one_overview
    @site.posts.docs.select { |p| p.data['content_type'] == '周报分稿' }.each do |post|
      parents = @catalog['weekly'].select { |issue| issue['reports'].any? { |r| r['url'] == post.url } }
      assert_equal 1, parents.size, post.path
      overview_path = parents.first['overview'].url.delete_prefix('/') + 'index.html'
      overview_links = urls(page(overview_path).css('.article-context a[href]'))
      assert_includes overview_links, post.url, 'Every report must also be reachable inside its overview'
    end
  end

  def test_evergreen_articles_and_translations_remain_discoverable
    library_links = urls(page('library/index.html').css('main a[href]'))
    weekly_links = urls(page('weekly/index.html').css('main a[href]'))
    @site.posts.docs.each do |post|
      assert_includes library_links + weekly_links, post.url, "Article lost from reader entry points: #{post.path}"
    end
    assert_equal ['AI 基础设施与数据平台', '数据库与存储', '流式数据与消息系统'].sort, @site.categories.keys.sort
  end

  def test_home_and_navigation_use_the_curated_views
    home = page('index.html')
    assert_equal %w[首页 专题 存储训练 周报 关于], home.css('#sidebar .nav-link span').map { |e| e.text.strip }
    assert_equal @site.data['editorial']['featured'], urls(home.css('.featured-list .reading-link'))
    latest_issues = @catalog['weekly'].first(3).map { |item| item['overview'].data['issue'] }
    assert_equal latest_issues, home.css('main [data-weekly-issue]').map { |e| e['data-weekly-issue'].to_i }
    assert_equal 3, home.css('main .hub-section').size
  end

  def test_duplicates_are_compatibility_pages_and_search_has_one_main_reading
    search = JSON.parse(File.read(File.join(@destination, 'assets/js/data/search.json')))
    all_urls = search.map { |item| item['url'].delete_prefix(@site.config.fetch('baseurl', '')) }
    refute_includes all_urls, '/posts/raas-tail-latency/'
    refute_includes all_urls, '/posts/tech-research/week-06/conferences-doris/'
    assert_equal 1, all_urls.count('/posts/raas-paper/')
    assert_includes page('posts/raas-tail-latency/index.html').at_css('link[rel=canonical]')['href'], '/posts/raas-paper/'
    combined = urls(page('posts/tech-research/week-06/conferences-doris/index.html').css('main a[href]'))
    assert_includes combined, '/posts/tech-research/week-06/conferences/'
    assert_includes combined, '/posts/tech-research/week-06/doris-tsdb/'
  end

  def test_legacy_engineering_pages_share_the_four_navigation_destinations
    %w[tech_designs/zk-kafka-jbod-failure-handling.html tech_designs/agent-infra/observability-dashboard.html].each do |path|
      assert_equal %w[首页 专题 周报 关于], page(path).css('.global-nav .nav-link').map(&:text)
    end
  end
end
