#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require "rexml/document"
require "uri"

SITE_ORIGIN = "https://ouchi-mente.jp"
FEATURES_DIR = "features"

errors = []

def read(path)
  File.read(path)
end

def canonical_path_for_html(path)
  source = read(path)
  canonical = source[/<link\s+rel="canonical"\s+href="https:\/\/ouchi-mente\.jp\/([^"]*)"/, 1]
  return canonical if canonical

  return "" if path == "index.html"

  path.sub(%r{/index\.html$}, "/")
end

feature_files = Dir["#{FEATURES_DIR}/*.html"].reject { |path| File.basename(path) == "index.html" }.sort
feature_slugs = feature_files.map { |path| File.basename(path, ".html") }

feature_files.each do |path|
  slug = File.basename(path, ".html")
  expected_url = "#{SITE_ORIGIN}/features/#{slug}"
  source = read(path)

  canonical = source[/<link\s+rel="canonical"\s+href="([^"]+)"/, 1]
  errors << "#{path}: missing canonical" unless canonical
  errors << "#{path}: canonical must be #{expected_url}, got #{canonical}" if canonical && canonical != expected_url

  og_url = source[/<meta\s+property="og:url"\s+content="([^"]+)"/, 1]
  errors << "#{path}: og:url must be #{expected_url}, got #{og_url}" if og_url && og_url != expected_url

  if source.include?("mainEntityOfPage")
    main_entity = source[/"mainEntityOfPage"\s*:\s*"([^"]+)"/, 1]
    errors << "#{path}: mainEntityOfPage must be #{expected_url}, got #{main_entity}" if main_entity != expected_url
  end

  h1_count = source.scan(/<h1[\s>]/).length
  errors << "#{path}: expected exactly one h1, got #{h1_count}" unless h1_count == 1
end

all_html = Dir["**/*.html"].sort
all_html.each do |path|
  source = read(path)
  feature_slugs.each do |slug|
    bad_patterns = [
      "https://ouchi-mente.jp/features/#{slug}.html",
      "/features/#{slug}.html",
      "features/#{slug}.html"
    ]
    bad_patterns.each do |pattern|
      errors << "#{path}: feature link should omit .html: #{pattern}" if source.include?(pattern)
    end
  end
end

feature_files.each do |path|
  source = read(path)
  feature_slugs.each do |slug|
    pattern = "href=\"#{slug}.html\""
    errors << "#{path}: feature link should omit .html: #{pattern}" if source.include?(pattern)
  end
end

features_json = JSON.parse(read("data/features.json"))
(features_json["features"] || []).each do |feature|
  url = feature["url"].to_s
  slug = feature["slug"].to_s

  if url.start_with?("/features/")
    errors << "data/features.json: #{slug} url should omit .html: #{url}" if url.end_with?(".html")

    feature_path = "features/#{url.sub(%r{^/features/}, "")}.html"
    errors << "data/features.json: #{slug} points to missing #{feature_path}" unless File.exist?(feature_path)
  end
end

begin
  REXML::Document.new(read("sitemap.xml"))
rescue REXML::ParseException => e
  errors << "sitemap.xml: invalid XML: #{e.message.lines.first&.strip}"
end

sitemap_urls = read("sitemap.xml").scan(%r{<loc>https://ouchi-mente\.jp/([^<]*)</loc>}).flatten
canonical_urls = all_html.map { |path| canonical_path_for_html(path) }.uniq

missing = canonical_urls - sitemap_urls
extra = sitemap_urls - canonical_urls

missing.each { |url| errors << "sitemap.xml: missing canonical URL #{SITE_ORIGIN}/#{url}" }
extra.each { |url| errors << "sitemap.xml: extra non-canonical URL #{SITE_ORIGIN}/#{url}" }

sitemap_urls.grep(%r{^features/.+\.html$}).each do |url|
  errors << "sitemap.xml: feature URL should omit .html: #{SITE_ORIGIN}/#{url}"
end

if errors.empty?
  puts "SEO validation OK"
else
  warn "SEO validation failed:"
  errors.each { |error| warn "- #{error}" }
  exit 1
end
