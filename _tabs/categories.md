---
icon: fas fa-stream
order: 2
layout: page
title: 分类
---

{% assign cat_names = "个人观点输出|技术调研" | split: "|" %}

{% for cat_name in cat_names %}

## [{{ cat_name }}](/ai_memory_chang_ai_team/categories/{{ cat_name | uri_escape }}/)

{% assign all_posts = "" | split: "" %}
{% assign subcats = "" | split: "" %}
{% for post in site.posts %}
  {% if post.categories contains cat_name %}
    {% assign all_posts = all_posts | push: post %}
    {% assign subcat = post.categories | where_exp: "c", "c != cat_name" | join: " > " %}
    {% unless subcats contains subcat %}
      {% assign subcats = subcats | push: subcat %}
    {% endunless %}
  {% endif %}
{% endfor %}

{% assign count = all_posts | size %}
<span class="text-muted">（{{ count }} 篇）</span>

{% if subcats.size > 0 %}
<ul class="subcat-list">
{% for sc in subcats %}
  {% assign sc_posts = "" | split: "" %}
  {% for post in all_posts %}
    {% assign post_subcat = post.categories | where_exp: "c", "c != cat_name" | join: " > " %}
    {% if post_subcat == sc %}
      {% assign sc_posts = sc_posts | push: post %}
    {% endif %}
  {% endfor %}
  <li>
    <a href="/ai_memory_chang_ai_team/categories/{{ cat_name | uri_escape }}/#{{ sc | slugify }}"><strong>{{ sc }}</strong></a>
    <span class="text-muted">（{{ sc_posts | size }} 篇）</span>
    <ul>
    {% for post in sc_posts limit: 5 %}
      <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
    {% endfor %}
    {% assign remaining = sc_posts.size | minus: 5 %}
    {% if remaining > 0 %}
      <li class="text-muted"><em>... 还有 {{ remaining }} 篇</em></li>
    {% endif %}
    </ul>
  </li>
{% endfor %}
</ul>
{% elsif count > 0 %}
<ul>
{% for post in all_posts limit: 10 %}
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
