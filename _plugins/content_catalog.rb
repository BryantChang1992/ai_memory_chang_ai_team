# Build reader-facing views from article metadata. New weekly issues and series
# chapters join their views automatically; editorial.yml only controls curation.
module ContentCatalog
  def self.build(site)
    posts = site.posts.docs.reverse
    issues = posts.select { |p| p.data['content_type'] == '周报' }
                  .sort_by { |p| [p.date.year, p.data.fetch('issue')] }.reverse
    weekly = issues.map do |overview|
      children = posts.select do |p|
        p.data['content_type'] == '周报分稿' && p.data['issue'] == overview.data['issue'] && p.date.year == overview.date.year
      end.sort_by { |p| p.data['title'] }
      links = children.map { |p| { 'title' => p.data['reading_title'] || p.data['title'], 'url' => p.url } }
      # Later issues still contain unique HTML reports. Keep them reachable until
      # they are migrated, and avoid repeating different anchors of one report.
      overview.content.scan(%r{'(/tech_research/([^/]+)/[^']+\.html)(?:\#[^']*)?'}) do |url, source|
        links << { 'title' => site.data['editorial']['weekly_sources'][source] || '补充阅读', 'url' => url }
      end
      { 'overview' => overview, 'reports' => links.uniq { |link| link['url'] } }
    end
    { 'weekly' => weekly, 'articles' => posts.reject { |p| ['周报', '周报分稿', '论文翻译'].include?(p.data['content_type']) } }
  end

  class Generator < Jekyll::Generator
    priority :low
    def generate(site)
      site.data['catalog'] = ContentCatalog.build(site)
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
