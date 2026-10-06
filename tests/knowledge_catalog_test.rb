require 'jekyll'
require 'minitest/autorun'
require 'nokogiri'
require 'uri'
require_relative '../_plugins/knowledge_catalog'

class KnowledgeCatalogTest < Minitest::Test
  def setup
    @site = Jekyll::Site.new(Jekyll.configuration('quiet' => true))
    @site.reset
    @site.read
    @catalog = KnowledgeCatalog.build(@site)
    @destination = ENV.fetch('SITE_DESTINATION', '_site')
  end

  def page(url)
    Nokogiri::HTML(File.read(File.join(@destination, url.delete_prefix('/'), 'index.html')))
  end

  def urls(nodes)
    nodes.map { |n| URI::DEFAULT_PARSER.unescape(n['href']).delete_prefix(@site.config['baseurl']) }
  end

  def test_every_resource_has_one_home_and_is_reachable_through_it
    resources = @catalog['resources']
    assert_equal resources.size, resources.map { |r| r['url'] }.uniq.size
    expected = @site.posts.docs.reject { |p| KnowledgeCatalog::WEEKLY_TYPES.include?(p.data['content_type']) }.map(&:url)
    expected += @site.data['editorial']['engineering'].map { |r| r['url'] }
    assert_equal expected.uniq.sort, resources.map { |r| r['url'] }.sort
    @catalog['collections'].each do |collection|
      document = page(collection['url'])
      assert_equal collection['title'], document.at_css('h1').text.strip
      assert_equal collection['title'], document.at_css('#topbar-title').text.strip
      links = urls(document.css('main a[href]'))
      collection['items'].each { |item| assert_includes links, item['url'], collection['title'] }
    end
    refute @catalog['collections'].any? { |c| c['id'].end_with?('-more') }, 'Review classification for current content'
  end

  def test_landing_page_is_a_directory_not_an_article_feed
    landing = page('/library/')
    assert_empty landing.css('.topic-articles')
    assert_equal @catalog['collections'].map { |c| c['url'] }, urls(landing.css('.collection-card'))
    assert_operator landing.css('main a[href]').size, :<, 30
    %w[streaming storage ai fluss doris engineering].each { |id| assert landing.at_css("##{id}"), 'Preserve old anchors' }
  end

  def test_papers_use_source_identity_and_translations_are_attached
    assert_nil KnowledgeCatalog.paper_family({}), 'Unmapped articles must remain classifiable'
    paper = @catalog['resources'].find { |r| r['url'] == '/knowledge/Agent-First-Data-精读分析/' }
    assert_equal 'paper', paper['role'] # Previously labeled as source-code analysis.
    concept = @catalog['resources'].find { |r| r['url'] == '/knowledge/Agent-First-Branch-Transactions-分支事务/' }
    assert_equal 'ai-data', concept['collection_id']
    consensus = @catalog['collections'].find { |c| c['id'] == 'consensus' }
    event = consensus['sections'].find { |g| g['id'] == 'paper' }['items'].find { |r| r['url'] == '/posts/event-horizon-paper/' }
    assert_equal ['/posts/event-horizon-translation/'], event['supplements'].map { |r| r['url'] }
    pending = @catalog['resources'].find { |r| r['url'] == '/knowledge/LSM-Raft-原文待核验/' }
    assert_equal 'pending', pending['role']
    @catalog['collections'].each { |c| refute c['route'].any? { |r| %w[pending translation].include?(r['role']) } }
  end

  def test_series_order_and_return_navigation_are_preserved
    %w[fluss doris].each do |id|
      collection = @catalog['collections'].find { |c| c['id'] == id }
      expected = @site.posts.docs.select { |p| p.data['series'] == id }.sort_by { |p| p.data['series_order'] }.map(&:url)
      assert_equal expected, urls(page(collection['url']).css('.chapter-list a'))
      expected.each do |url|
        assert_includes urls(page(url).css('.article-context a')), collection['url']
      end
    end
  end

  def test_search_index_keeps_each_resource_once_and_excludes_weekly_reports
    index = page('/knowledge/')
    assert_equal @catalog['resources'].map { |r| r['url'] }.sort, urls(index.css('[data-resource] .resource-title')).sort
    assert_equal @catalog['count'], index.css('[data-resource]').size
    assert index.at_css('label[for=knowledge-query]')
    assert index.at_css('[role=status][aria-live=polite]')
    assert index.at_css('noscript')
  end
end
