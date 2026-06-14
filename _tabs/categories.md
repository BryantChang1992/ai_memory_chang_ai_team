---
icon: fas fa-stream
order: 2
layout: page
title: 分类
---

{% assign cat_names = "个人观点输出|项目文档|技术调研" | split: "|" %}
{% for cat_name in cat_names %}
  {% assign cat_posts = site.categories[cat_name] %}
  {% assign count = cat_posts | size %}
  {% if count > 0 %}
  <h2 id="{{ cat_name | slugify }}">
    <a href="/ai_memory_chang_ai_team/categories/{{ cat_name | slugify }}/">{{ cat_name }}</a>
    <span class="text-muted">（{{ count }} 篇）</span>
  </h2>
  <ul>
    {% for post in cat_posts limit: 10 %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small class="text-muted">{{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
    {% endfor %}
    {% if count > 10 %}
    <li><a href="/ai_memory_chang_ai_team/categories/{{ cat_name | slugify }}/">... 查看全部 {{ count }} 篇</a></li>
    {% endif %}
  </ul>
  {% endif %}
{% endfor %}
