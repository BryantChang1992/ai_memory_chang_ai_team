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

  def test_cross_year_revisions_keep_original_issue_and_children
    post_class = Struct.new(:data, :date, :url, :content)
    old = post_class.new({ 'content_type' => '周报', 'issue' => 11, 'issue_date' => '2026-09-11' }, Time.new(2027, 1, 10), '/old/', '')
    report = post_class.new({ 'content_type' => '周报分稿', 'issue' => 11, 'issue_date' => '2026-09-11', 'title' => 'Report' }, Time.new(2026, 9, 11), '/report/', '')
    recent = post_class.new({ 'content_type' => '周报', 'issue' => 1, 'issue_date' => '2027-01-01' }, Time.new(2027, 1, 1), '/new/', '')
    fixture = Struct.new(:posts, :data).new(Struct.new(:docs).new([report, recent, old]), @site.data)
    weekly = ContentCatalog.build(fixture)['weekly']
    assert_equal ['/new/', '/old/'], weekly.map { |issue| issue['overview'].url }
    assert_equal ['/report/'], weekly.last['reports'].map { |item| item['url'] }
  end

  def test_migrated_comparisons_render_as_tables
    {
      'posts/fluss-storage-engine/index.html' => 'ArrowWalBuilder',
      'posts/fluss-rpc-network/index.html' => 'GatewayClientProxy',
      'posts/tech-research/week-08/index.html' => '4.1 增强',
      'posts/tech-research/week-09/index.html' => 'KIP-1314'
    }.each do |path, text|
      assert page(path).css('article .content table').any? { |table| table.text.include?(text) },
             "Expected a real comparison table for #{text} in #{path}"
    end
  end

  def test_evergreen_articles_and_translations_remain_discoverable
    index_links = urls(page('knowledge/index.html').css('main a[href]'))
    weekly_links = urls(page('weekly/index.html').css('main a[href]'))
    @site.posts.docs.each do |post|
      assert_includes index_links + weekly_links, post.url, "Article lost from reader entry points: #{post.path}"
    end
    assert_equal ['AI 基础设施与数据平台', '数据库与存储', '流式数据与消息系统'].sort, @site.categories.keys.sort
  end

  def test_home_and_navigation_use_the_curated_views
    home = page('index.html')
    assert_equal %w[首页 专题 存储训练 周报 流存储技术观察 关于], home.css('#sidebar .nav-link span').map { |e| e.text.strip }
    assert_equal @site.data['editorial']['featured'], urls(home.css('.featured-list .reading-link'))
    latest_issues = @catalog['weekly'].first(3).map { |item| item['overview'].data['issue'] }
    assert_equal latest_issues, home.css('main [data-weekly-issue]').map { |e| e['data-weekly-issue'].to_i }
    assert_equal 3, home.css('main .hub-section').size
  end

  def test_stream_observer_is_an_independent_topic
    observer = page('stream-storage-observer/index.html')
    entry = '/stream-storage-observer/2026-10-09/'
    assert_includes urls(observer.css('main a[href]')), entry
    assert_includes urls(page('index.html').css('main a[href]')), '/stream-storage-observer/'
    assert_includes urls(page('library/index.html').css('main a[href]')), '/stream-storage-observer/'
    refute_includes urls(page('weekly/index.html').css('main .weekly-issue a[href]')), entry
    assert_equal 1, observer.css('[data-observer-issue="2026-10-09"]').size
    article = page('stream-storage-observer/2026-10-09/index.html')
    %w[Kafka Fluss AutoMQ].each { |name| assert_includes article.css('main h2').text, name }
    assert_includes article.at_css('title').text, '第 1 期'
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

  def test_combined_week_twelve_thirteen_has_one_reader_entry
    combined_url = '/posts/tech-research/week-12-13/'
    combined = @catalog['weekly'].select { |item| item['overview'].url == combined_url }
    assert_equal 1, combined.size
    assert_equal 13, combined.first['overview'].data['issue']
    assert_equal [12, 13], combined.first['overview'].data['covered_issues']
    assert_empty combined.first['reports']
    assert_includes page('index.html').at_css('main [data-weekly-issue="13"]').text, 'W12–13'
    weekly = page('weekly/index.html')
    assert_includes weekly.at_css('[data-weekly-issue="13"] .reading-meta').text, 'Week 12–13'
    assert_empty weekly.css('[data-weekly-issue="12"]')

    search = JSON.parse(File.read(File.join(@destination, 'assets/js/data/search.json')))
    all_urls = search.map { |item| item['url'].delete_prefix(@site.config.fetch('baseurl', '')) }
    assert_equal 1, all_urls.count(combined_url)
    old_urls = ['/posts/tech-research/week-12/', '/posts/tech-research/week-13/'] +
               %w[lakehouse streaming distributed-storage ai-infra].map { |domain| "/posts/tech-research/week-12/#{domain}/" }
    old_urls.each { |url| refute_includes all_urls, url }
  end

  def test_combined_issue_preserves_old_urls_and_section_destinations
    combined_url = '/posts/tech-research/week-12-13/'
    domains = %w[lakehouse streaming distributed-storage ai-infra]
    destinations = { 'week-12/' => combined_url, 'week-13/' => combined_url }
    domains.each { |domain| destinations["week-12/#{domain}/"] = "#{combined_url}##{domain}" }
    destinations.each do |old_path, destination|
      old_page = page("posts/tech-research/#{old_path}index.html")
      assert_equal @site.config['url'] + @site.config['baseurl'] + combined_url,
                   old_page.at_css('link[rel=canonical]')['href']
      assert_equal 'noindex', old_page.at_css('meta[name=robots]')['content']
      link = old_page.at_css('#content-destination')
      assert_equal @site.config['baseurl'] + destination, link['href']
      assert_equal 'false', link['data-preserve-hash']
    end
    combined = page('posts/tech-research/week-12-13/index.html')
    domains.each { |domain| assert combined.at_css("h2##{domain}"), "Missing section #{domain}" }
    assert_equal 1, combined.css('article h1').size
    refute_includes combined.css('article').text, '审阅稿'
  end

  def test_legacy_engineering_pages_share_the_four_navigation_destinations
    %w[tech_designs/zk-kafka-jbod-failure-handling.html tech_designs/agent-infra/observability-dashboard.html].each do |path|
      assert_equal %w[首页 专题 周报 关于], page(path).css('.global-nav .nav-link').map(&:text)
    end
  end
end
