import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="site-footer border-t bg-muted/40 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-foreground mb-4">
              <span className="h-7 w-7 rounded-lg bg-primary p-1 transition-transform duration-300 group-hover:-rotate-6">
                <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="" className="h-full w-full rounded-md" />
              </span>
              Trav<span className="text-primary">-World</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore and book trusted experiences across India's finest destinations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services?category=hotels" className="hover:text-primary">Luxury Hotels</Link></li>
              <li><Link href="/services?category=restaurants" className="hover:text-primary">Fine Dining</Link></li>
              <li><Link href="/services?category=salons" className="hover:text-primary">Salons & Spas</Link></li>
              <li><Link href="/services?category=doctors" className="hover:text-primary">Specialist Doctors</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Partner With Us</a></li>
              <li><a href="#" className="hover:text-primary">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
              <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Trav-World. All rights reserved.
          </p>
          <div className="flex gap-4">
            <div className="h-8 w-12 bg-muted rounded"></div>
            <div className="h-8 w-12 bg-muted rounded"></div>
            <div className="h-8 w-12 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
