---
icon: fas fa-stream
order: 2
layout: page
title: 分类
---

{% assign cat_names = "个人观点输出|项目文档|技术调研" | split: "|" %}

{% for cat_name in cat_names %}

## [{{ cat_name }}](/ai_memory_chang_ai_team/categories/{{ cat_name | uri_escape }}/)

{% assign found_posts = "" | split: "" %}
{% for post in site.posts %}
  {% if post.categories contains cat_name %}
    {% assign found_posts = found_posts | push: post %}
  {% endif %}
{% endfor %}

{% assign count = found_posts | size %}
<span class="text-muted">（{{ count }} 篇）</span>

{% if count > 0 %}
<ul>
{% for post in found_posts limit: 10 %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small class="text-muted">{{ post.date | date: "%Y-%m-%d" }}</small>
  </li>
{% endfor %}
{% if count > 10 %}
  <li><a href="/ai_memory_chang_ai_team/categories/{{ cat_name | uri_escape }}/">... 查看全部 {{ count }} 篇</a></li>
{% endif %}
</ul>
{% endif %}

{% endfor %}
