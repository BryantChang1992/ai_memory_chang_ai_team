# Reader-facing hierarchy is independent of the Obsidian file/URL mapping.
require 'json'

module KnowledgeCatalog
  WEEKLY_TYPES = ['周报', '周报分稿'].freeze
  TRANSLATION_TYPES = ['论文翻译', '论文译述', '论文译读'].freeze

  def self.role(source, data)
    return 'pending' if data['content_type'] == '来源核验' || data['knowledge_status'] == 'pending-source'
    return 'translation' if TRANSLATION_TYPES.include?(data['content_type']) || source.include?('全文翻译')
    return 'paper' if source.include?('/sources/papers/') || source.start_with?('论文精读/')
    return 'overview' if source.include?('/synthesis/') || data['content_type'] == '技术综述' || data['title'].to_s.include?('综述')
    return 'concept' if source.start_with?('知识库/wiki/') && data['content_type'] != '工程实践'
    'practice'
  end

  def self.paper_family(entry)
    paths = [entry['vault_path'], *entry.fetch('aliases', [])].compact
    paper = paths.find { |p| p.include?('/sources/papers/') }
    paper && File.dirname(paper)
  end

  def self.build(site)
    config = site.data.fetch('knowledge')
    manifest = JSON.parse(File.read(File.join(site.source, 'docs/obsidian-sync-manifest.json')))
    mapped = manifest['entries'].to_h { |e| [e['url'], e] }
    definitions = config['collections']
    roles = config['roles'].to_h { |r| [r['id'], r['title']] }
    resources = site.posts.docs.reject { |p| WEEKLY_TYPES.include?(p.data['content_type']) }.map do |post|
      entry = mapped[post.url] || {}
      source = entry['vault_path'] || post.data['knowledge_source'].to_s
      { 'url' => post.url, 'title' => post.data['title'], 'topic' => post.data['topic'],
        'role' => role(source, post.data), 'source' => source, 'family' => paper_family(entry),
        'series' => post.data['series'], 'series_order' => post.data['series_order'], 'post' => post }
    end
    site.data['editorial'].fetch('engineering', []).each do |item|
      next if resources.any? { |r| r['url'] == item['url'] }
      resources << item.merge('role' => 'practice', 'source' => mapped.dig(item['url'], 'vault_path').to_s)
    end
    resources.each do |resource|
      # Match the source identity, not incidental keywords in a descriptive title.
      identity = resource['source'].empty? ? resource['title'] : resource['source']
      collection = definitions.find do |d|
        d['topic'] == resource['topic'] && Regexp.new(d['match'], Regexp::IGNORECASE).match?(identity)
      end
      resource['collection_id'] = collection ? collection['id'] : "#{resource['topic'] || 'storage'}-more"
      resource['role_title'] = roles.fetch(resource['role'])
    end
    # New, unclassified articles remain reachable without silently choosing a topic.
    fallback = resources.map { |r| r['collection_id'] }.uniq.reject { |id| definitions.any? { |d| d['id'] == id } }.map do |id|
      { 'id' => id, 'topic' => id.sub(/-more$/, ''), 'title' => '综合阅读',
        'description' => '跨主题文章与补充阅读。', 'route' => [] }
    end
    collections = (definitions + fallback).map do |definition|
      items = resources.select { |r| r['collection_id'] == definition['id'] }.sort_by { |r| r['title'] }
      route = definition.fetch('route', []).map do |step|
        target = resources.find { |r| r['url'] == step['url'] }
        raise "Unknown reading-path article: #{step['url']}" unless target
        target.merge('why' => step['why'])
      end
      series = items.select { |r| r['series'] == definition['series'] && r['series'] }.sort_by { |r| r['series_order'] || 0 }
      sections = config['roles'].reject { |r| r['id'] == 'translation' }.filter_map do |group|
        group_items = items.select { |r| r['role'] == group['id'] && !series.include?(r) }.map do |r|
          supplements = items.select { |s| s['role'] == 'translation' && s['family'] && s['family'] == r['family'] }
          r.merge('supplements' => supplements)
        end
        # A translation without a reviewed main paper remains explicitly reachable.
        if group['id'] == 'paper'
          paired = group_items.flat_map { |r| r['supplements'] }.map { |r| r['url'] }
          group_items += items.select { |r| r['role'] == 'translation' && !paired.include?(r['url']) }
        end
        group.merge('items' => group_items) unless group_items.empty?
      end
      definition.merge('url' => "/library/#{definition['id']}/", 'items' => items,
                       'count' => items.size, 'route' => route, 'series_items' => series, 'sections' => sections)
    end.reject { |c| c['items'].empty? }
    resources.each do |resource|
      collection = collections.find { |c| c['id'] == resource['collection_id'] }
      resource['collection_title'] = collection['title']
      resource['collection_url'] = collection['url']
      post = resource.delete('post')
      post.data['reading_home'] = resource.reject { |k, _| %w[source family].include?(k) } if post
    end
    { 'collections' => collections, 'resources' => resources.sort_by { |r| r['title'] }, 'count' => resources.size }
  end

  def self.generate(site)
    catalog = build(site)
    site.data['knowledge_catalog'] = catalog
    catalog['collections'].each do |collection|
      page = Jekyll::PageWithoutAFile.new(site, site.source, "library/#{collection['id']}", 'index.html')
      page.data.merge!('layout' => 'page', 'title' => collection['title'],
                       'description' => collection['description'], 'reading_collection' => collection)
      page.content = '{% include knowledge-collection.html %}'
      site.pages << page
    end
  end
end
