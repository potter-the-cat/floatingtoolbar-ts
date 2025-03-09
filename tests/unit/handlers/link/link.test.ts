import { describe, it, expect, beforeEach } from '@jest/globals';
import { findClosestLink, isValidUrl, ensureValidUrl } from '@/utils/link';

describe('Link Utilities', () => {
    describe('findClosestLink', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div>
                    <a href="#" id="link1">Link 1</a>
                    <div>
                        <span>Text in <a href="#" id="link2">Link 2</a></span>
                    </div>
                </div>
            `;
        });

        it('should find link when node is the anchor element', () => {
            const link = document.getElementById('link1');
            const result = findClosestLink(link);
            expect(result).toBe(link);
        });

        it('should find link when node is inside anchor element', () => {
            const link = document.getElementById('link2');
            if (!link) throw new Error('Link element not found');
            
            const textNode = link.firstChild;
            if (!textNode) throw new Error('Text node not found');
            
            const result = findClosestLink(textNode);
            expect(result).toBe(link);
        });

        it('should return null when no link is found', () => {
            const div = document.createElement('div');
            const result = findClosestLink(div);
            expect(result).toBeNull();
        });
    });

    describe('isValidUrl', () => {
        it('should validate complete URLs', () => {
            expect(isValidUrl('https://example.com')).toBe(true);
            expect(isValidUrl('http://example.com')).toBe(true);
            // Other protocols are not supported by ensureValidUrl
            expect(isValidUrl('ftp://example.com')).toBe(false);
        });

        it('should validate URLs without protocol', () => {
            // These will be prefixed with https:// by ensureValidUrl
            expect(isValidUrl('example.com')).toBe(true);
            expect(isValidUrl('www.example.com')).toBe(true);
        });

        it('should validate IP addresses', () => {
            expect(isValidUrl('http://192.168.1.1')).toBe(true);
            expect(isValidUrl('https://192.168.1.1')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(isValidUrl('')).toBe(false);
            // Invalid hostname (no dot)
            expect(isValidUrl('not a url')).toBe(false);
            // No hostname
            expect(isValidUrl('http://')).toBe(false);
            // Invalid IP format
            expect(isValidUrl('http://256.256.256.256')).toBe(false);
            // Single-part domain (no TLD)
            expect(isValidUrl('http://localhost')).toBe(false);
            // TLD too short
            expect(isValidUrl('http://example.a')).toBe(false);
        });
    });

    describe('ensureValidUrl', () => {
        it('should return complete URLs unchanged', () => {
            expect(ensureValidUrl('https://example.com')).toBe('https://example.com');
            expect(ensureValidUrl('http://example.com')).toBe('http://example.com');
        });

        it('should add https:// to URLs without protocol', () => {
            expect(ensureValidUrl('example.com')).toBe('https://example.com');
            expect(ensureValidUrl('www.example.com')).toBe('https://www.example.com');
        });

        it('should handle invalid URLs', () => {
            expect(ensureValidUrl('')).toBe('');
            // The function only adds protocol, doesn't validate the URL
            expect(ensureValidUrl('not a url')).toBe('https://not a url');
        });
    });
}); 