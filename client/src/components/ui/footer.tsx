import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <p className="text-gray-600">
              Zinglebell is your premier destination for delightful dining experiences. 
              We pride ourselves on offering exceptional service and mouthwatering cuisine.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-600">
              <p>Email: contact@zinglebell.com</p>
              <p>Phone: +91 1800-123-4567</p>
              <p>Address: 123 Food Street, Foodie District</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/menu">
                <a className="text-gray-600 hover:text-gray-900 block">Menu</a>
              </Link>
              <Link href="/orders">
                <a className="text-gray-600 hover:text-gray-900 block">Orders</a>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>© {new Date().getFullYear()} Zinglebell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
