# Ordered category paths may contain both directly filed posts and descendants.
module BlogCategories
  def self.node(name, path)
    {
      "name" => name,
      "url" => name.empty? ? "/categories/" : "/categories/#{Jekyll::Utils.slugify(name)}/",
      "id" => "category-#{path.map { |part| Jekyll::Utils.slugify(part) }.join('--')}",
      "posts" => [], "direct_posts" => [], "children" => []
    }
  end

  def self.insert(parent, path, post, prefix = [])
    parent["posts"] << post unless parent["posts"].include?(post)
    if path.empty?
      parent["direct_posts"] << post unless parent["direct_posts"].include?(post)
      return
    end
    name, *rest = path
    child = parent["children"].find { |item| item["name"] == name }
    unless child
      child = node(name, prefix + [name])
      parent["children"] << child
    end
    insert(child, rest, post, prefix + [name])
  end

  def self.build(posts)
    root = node("", [])
    archives = {}
    posts.each do |post|
      path = post.data.fetch("categories", [])
      insert(root, path, post)
      path.uniq.each do |name|
        archive = archives[name] ||= node(name, [name])
        insert(archive, path.drop(path.index(name) + 1), post, [name])
      end
    end
    { "roots" => root["children"], "archives" => archives }
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  site.data["blog_categories"] = BlogCategories.build(site.posts.docs.reverse)
  site.posts.docs.each do |post|
    post.data["mermaid"] = true if post.content.match?(/^\s*```mermaid\s*$/)
  end
end
