import unittest, os
os.environ.setdefault('JWT_SECRET','test-secret-only-not-for-production-123456789')
os.environ.setdefault('INTERNAL_TOKEN','test-internal-only-not-for-production-123456')
from app import clean_sources, allowed_document_url
class SecurityTests(unittest.TestCase):
    def test_only_public_sources(self):
        self.assertEqual(clean_sources([{'public':False,'title':'Private','url':'/x'},{'public':True,'title':'Public','url':'/services/ai'}]),[{'title':'Public','url':'/services/ai'}])
    def test_no_local_document_urls(self):
        for value in ['file:///etc/passwd','http://127.0.0.1','http://169.254.169.254/latest','http://localhost','https://user:password@example.com']:
            with self.assertRaises(ValueError): allowed_document_url(value)
if __name__=='__main__': unittest.main()
