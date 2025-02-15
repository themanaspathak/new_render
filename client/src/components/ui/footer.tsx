import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <p className="text-gray-600">
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Zingle</span>
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Bell</span>
              {" "}is your premier destination for delightful dining experiences. 
              We pride ourselves on offering exceptional service and mouthwatering cuisine.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-600">
              <p>Email: contact@zinglebell.com</p>
              <p>Phone: +91 8769456454</p>
              <p>Address: Udaipur, Rajasthan</p>
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