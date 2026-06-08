<?php

namespace App\Http\Controllers;

use App\Modules\Categories\Models\Category;
use App\Modules\Products\Models\Product;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    private const CACHE_KEY = 'sitemap_xml';
    private const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

    public function __invoke(): Response
    {
        $xml = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn () => $this->generate());

        return response($xml, 200)
            ->header('Content-Type', 'application/xml; charset=utf-8');
    }

    private function generate(): string
    {
        $base = rtrim(config('app.url'), '/');

        $urls = [];

        // ── Static pages ─────────────────────────────────────────────────────
        foreach ($this->staticPages() as $page) {
            $urls[] = $this->urlEntry(
                loc: $base . $page['path'],
                changefreq: $page['changefreq'],
                priority: $page['priority'],
            );
        }

        // ── Category filter pages: /categories?categories={slug} ─────────────
        Category::query()
            ->select(['short_link', 'updated_at'])
            ->orderBy('id')
            ->each(function (Category $category) use ($base, &$urls): void {
                if (filled($category->short_link)) {
                    $urls[] = $this->urlEntry(
                        loc: $base . '/categories?categories=' . rawurlencode($category->short_link),
                        changefreq: 'weekly',
                        priority: '0.8',
                        lastmod: $category->updated_at?->toAtomString(),
                    );
                }
            });

        // ── Product detail pages: /products/{short_link} ─────────────────────
        Product::query()
            ->where('is_active', true)
            ->select(['short_link', 'updated_at'])
            ->orderBy('id')
            ->each(function (Product $product) use ($base, &$urls): void {
                if (filled($product->short_link)) {
                    $urls[] = $this->urlEntry(
                        loc: $base . '/products/' . rawurlencode($product->short_link),
                        changefreq: 'weekly',
                        priority: '0.7',
                        lastmod: $product->updated_at?->toAtomString(),
                    );
                }
            });

        return implode("\n", [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...$urls,
            '</urlset>',
        ]);
    }

    private function urlEntry(string $loc, string $changefreq, string $priority, ?string $lastmod = null): string
    {
        $lastmodTag = $lastmod ? "\n    <lastmod>{$lastmod}</lastmod>" : '';

        return <<<XML
  <url>
    <loc>{$loc}</loc>{$lastmodTag}
    <changefreq>{$changefreq}</changefreq>
    <priority>{$priority}</priority>
  </url>
XML;
    }

    /** @return list<array{path: string, changefreq: string, priority: string}> */
    private function staticPages(): array
    {
        return [
            ['path' => '/',           'changefreq' => 'weekly',  'priority' => '1.0'],
            ['path' => '/categories', 'changefreq' => 'weekly',  'priority' => '0.9'],
            ['path' => '/products',   'changefreq' => 'weekly',  'priority' => '0.8'],
            ['path' => '/gallery',    'changefreq' => 'monthly', 'priority' => '0.7'],
            ['path' => '/events',     'changefreq' => 'weekly',  'priority' => '0.7'],
            ['path' => '/contact',    'changefreq' => 'monthly', 'priority' => '0.6'],
        ];
    }
}
