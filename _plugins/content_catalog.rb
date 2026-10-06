# Build reader-facing views from article metadata. New weekly issues and series
# chapters join their views automatically; editorial.yml only controls curation.
require 'date'
require_relative 'knowledge_catalog'

module ContentCatalog
  # The issue's identity must not change when a post is revised next year.
  # Use the same editorial date as the weekly page and reading-context links.
  def self.issue_year(post)
    Date.parse(post.data.fetch('issue_date', post.date.to_s).to_s).year
  end

  def self.build(site)
    posts = site.posts.docs.reverse
    issues = posts.select { |p| p.data['content_type'] == '周报' }
                  .sort_by { |p| [issue_year(p), p.data.fetch('issue')] }.reverse
    weekly = issues.map do |overview|
      children = posts.select do |p|
        p.data['content_type'] == '周报分稿' && p.data['issue'] == overview.data['issue'] && issue_year(p) == issue_year(overview)
      end.sort_by { |p| p.data['title'] }
      links = children.map { |p| { 'title' => p.data['reading_title'] || p.data['title'], 'url' => p.url } }
      # Later issues still contain unique HTML reports. Keep them reachable until
      # they are migrated, and avoid repeating different anchors of one report.
      overview.content.scan(%r{'(/tech_research/([^/]+)/[^']+\.html)(?:\#[^']*)?'}) do |url, source|
        links << { 'title' => site.data['editorial']['weekly_sources'][source] || '补充阅读', 'url' => url }
      end
      { 'overview' => overview, 'reports' => links.uniq { |link| link['url'] } }
    end
    { 'weekly' => weekly, 'articles' => posts.reject { |p| (KnowledgeCatalog::WEEKLY_TYPES + KnowledgeCatalog::TRANSLATION_TYPES).include?(p.data['content_type']) } }
  end

  class Generator < Jekyll::Generator
    priority :low
    def generate(site)
      site.data['catalog'] = ContentCatalog.build(site)
      KnowledgeCatalog.generate(site)
      site.data.fetch('category_aliases', {}).each do |old_name, destination|
        next if site.categories.key?(old_name)
        page = Jekyll::PageWithoutAFile.new(site, site.source, "categories/#{Jekyll::Utils.slugify(old_name)}", 'index.html')
        page.data.merge!('layout' => 'redirect', 'title' => old_name, 'redirect_to' => destination, 'sitemap' => false)
        site.pages << page
      end
      # Previously paginated home URLs remain useful after the curated homepage.
      (2..6).each do |number|
        page = Jekyll::PageWithoutAFile.new(site, site.source, "page#{number}", 'index.html')
        page.data.merge!('layout' => 'redirect', 'title' => '文章归档', 'redirect_to' => '/archives/', 'sitemap' => false)
        site.pages << page
      end
    end
  end
end
