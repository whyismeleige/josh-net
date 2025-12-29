// hooks/useDynamicMetadata.ts
'use client';

import { useEffect } from 'react';

interface MetadataOptions {
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
}

export function useDynamicMetadata(options: MetadataOptions) {
  useEffect(() => {
    // Update title
    if (options.title) {
      document.title = options.title;
    }

    // Update favicon
    if (options.favicon) {
      updateFavicon(options.favicon);
    }

    // Update meta tags
    if (options.description) {
      updateMetaTag('description', options.description);
      updateMetaTag('og:description', options.description, 'property');
      updateMetaTag('twitter:description', options.description);
    }

    if (options.image) {
      updateMetaTag('og:image', options.image, 'property');
      updateMetaTag('twitter:image', options.image);
    }

    if (options.title) {
      updateMetaTag('og:title', options.title, 'property');
      updateMetaTag('twitter:title', options.title);
    }
  }, [options.title, options.description, options.favicon, options.image]);
}

function updateFavicon(iconUrl: string) {
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());

  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = iconUrl;
  document.head.appendChild(link);
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}