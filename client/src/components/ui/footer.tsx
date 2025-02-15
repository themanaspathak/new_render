import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <p className="text-gray-600">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Zingle</span>
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Bell</span>
              {" "}is your premier destination for delightful dining experiences in Udaipur. 
              We pride ourselves on offering exceptional service and mouthwatering cuisine.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-gray-600 hover:text-primary transition-colors">Home</Link>
              <Link href="/menu" className="block text-gray-600 hover:text-primary transition-colors">Menu</Link>
              <Link href="/orders" className="block text-gray-600 hover:text-primary transition-colors">Track Order</Link>
              <Link href="/contact" className="block text-gray-600 hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-600">
              <p>Email: contact@zinglebell.com</p>
              <p>Phone: +91 8769456454</p>
              <p>Address: Lake Palace Road, Near City Palace, Udaipur, Rajasthan 313001</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>© {new Date().getFullYear()} <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Zingle</span><span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Bell</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}