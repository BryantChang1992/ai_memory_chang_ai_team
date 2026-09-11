---
nav_hidden: true
icon: fas fa-stream
order: 2
layout: page
title: Categories
---
{% for category in site.data.blog_categories.roots %}
<section>
  <h2><a href="{{ category.url | relative_url }}">{{ category.name | escape }}</a> <span class="text-muted">（{{ category.posts.size }} 篇）</span></h2>
  {% include category-index.html node=category %}
</section>
{% endfor %}
