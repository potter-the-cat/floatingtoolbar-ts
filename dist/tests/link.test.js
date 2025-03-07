import { findClosestLink, isValidUrl, ensureValidUrl } from '../utils/link';
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
            if (!link)
                throw new Error('Link element not found');
            const textNode = link.firstChild;
            if (!textNode)
                throw new Error('Text node not found');
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
            expect(isValidUrl('ftp://example.com')).toBe(true);
        });
        it('should validate URLs without protocol', () => {
            expect(isValidUrl('example.com')).toBe(true);
            expect(isValidUrl('www.example.com')).toBe(true);
        });
        it('should reject invalid URLs', () => {
            expect(isValidUrl('')).toBe(false);
            expect(isValidUrl('not a url')).toBe(false);
            expect(isValidUrl('http://')).toBe(false);
        });
    });
    describe('ensureValidUrl', () => {
        it('should return complete URLs unchanged', () => {
            expect(ensureValidUrl('https://example.com')).toBe('https://example.com');
            expect(ensureValidUrl('http://example.com')).toBe('http://example.com');
        });
        it('should add http:// to URLs without protocol', () => {
            expect(ensureValidUrl('example.com')).toBe('http://example.com');
            expect(ensureValidUrl('www.example.com')).toBe('http://www.example.com');
        });
        it('should handle invalid URLs', () => {
            expect(ensureValidUrl('')).toBe('');
            expect(ensureValidUrl('not a url')).toBe('');
        });
    });
});
//# sourceMappingURL=link.test.js.map