require "jekyll"
require "minitest/autorun"
require "nokogiri"
require "uri"
require_relative "../_plugins/category_tree"

class CategoryTreeTest < Minitest::Test
  Post = Struct.new(:data)

  def test_owned_templates_and_posts_have_valid_liquid
    # Chirpy 7.5 itself contains legacy Liquid syntax, so validate our source
    # strictly without forcing the entire third-party theme into strict mode.
    Dir.glob('{_posts,_tabs,_layouts,_includes}/**/*.{md,html}').each do |path|
      assert Liquid::Template.parse(File.read(path), error_mode: :strict), path
    end
  end

  def setup
    @direct = Post.new({ "title" => "Direct", "categories" => ["技术调研", "周报"] })
    @nested = Post.new({ "title" => "Nested", "categories" => ["技术调研", "周报", "Kafka"] })
    @other = Post.new({ "title" => "Other", "categories" => ["技术调研", "Kafka"] })
    @tree = BlogCategories.build([@direct, @nested, @other])
  end

  def test_parent_keeps_direct_posts_alongside_subcategories
    weekly = @tree["archives"]["周报"]
    assert_equal [@direct], weekly["direct_posts"]
    assert_equal [@nested], weekly["children"].first["direct_posts"]
    assert_equal [@direct, @nested], weekly["posts"]
  end

  def test_leaf_archive_aggregates_different_depths_without_ancestor_groups
    kafka = @tree["archives"]["Kafka"]
    assert_empty kafka["children"]
    assert_equal [@nested, @other], kafka["direct_posts"]
  end

  def test_repeated_category_names_do_not_duplicate_articles
    post = Post.new({ "categories" => ["技术调研", "周报", "技术调研"] })
    archive = BlogCategories.build([post])["archives"]["技术调研"]
    assert_equal [post], archive["posts"]
    assert_equal [post], archive["children"].first["children"].first["direct_posts"]
  end

  def test_new_root_is_discoverable_and_chinese_urls_keep_the_slug
    tree = BlogCategories.build([Post.new({ "categories" => ["新分类"] })])
    assert_equal ["新分类"], tree["roots"].map { |node| node["name"] }
    assert_equal "/categories/新分类/", tree["roots"].first["url"]
  end

  def test_all_posts_appear_exactly_once_in_parent_groups
    collect = lambda { |node| node["direct_posts"] + node["children"].flat_map { |child| collect.call(child) } }
    posts = collect.call(@tree["archives"]["技术调研"])
    assert_equal 3, posts.length
    assert_equal [@direct, @nested, @other], posts
  end

  def test_generated_category_pages_cover_every_expected_article_once
    destination = ENV.fetch("SITE_DESTINATION", "_site")
    skip "Build the site before checking rendered category coverage" unless Dir.exist?("#{destination}/categories")
    site = Jekyll::Site.new(Jekyll.configuration("quiet" => true))
    site.reset
    site.read
    site.categories.each do |name, expected_posts|
      path = "#{destination}/categories/#{Jekyll::Utils.slugify(name)}/index.html"
      assert File.file?(path), "Missing category page: #{name}"
      document = Nokogiri::HTML(File.read(path))
      actual = document.css('[data-category-post] > a').map do |link|
        URI::DEFAULT_PARSER.unescape(link['href']).delete_prefix(site.config.fetch('baseurl', ''))
      end
      assert_equal expected_posts.map(&:url).uniq.sort, actual.sort, "Missing or duplicate articles in #{name}"
    end
  end

  def test_tag_urls_are_unique_and_keep_all_articles
    site = Jekyll::Site.new(Jekyll.configuration("quiet" => true))
    site.reset
    site.read
    slugs = site.tags.keys.map { |name| Jekyll::Utils.slugify(name) }
    assert_equal slugs.uniq.sort, slugs.sort, "Tag casing/slug collisions overwrite archive pages"
    destination = ENV.fetch("SITE_DESTINATION", "_site")
    return unless Dir.exist?("#{destination}/tags")
    site.tags.each do |name, expected_posts|
      path = "#{destination}/tags/#{Jekyll::Utils.slugify(name)}/index.html"
      assert File.file?(path), "Missing tag page: #{name}"
      actual = Nokogiri::HTML(File.read(path)).css('#page-tag li > a').map do |link|
        URI::DEFAULT_PARSER.unescape(link['href']).delete_prefix(site.config.fetch('baseurl', ''))
      end
      assert_equal expected_posts.map(&:url).uniq.sort, actual.sort, "Missing or duplicate articles tagged #{name}"
    end
  end
end
