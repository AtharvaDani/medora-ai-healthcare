import '../styles/footer.scss';

export default function Footer() {
  return (
    <div className="sc-footer">
      <footer className="text-light pt-5 pb-3 mt-5">
        <div className="container">
          <div className="row text-center text-md-start">
            <div className="col-md-4 mb-4">
              <h5 className="mb-3 footer-brand">
                <img src="/logo.svg" width={32} height={32} alt="" className="me-2 rounded-circle" />
                Medora AI
              </h5>
              <p>Smarter care, powered by AI. Your trusted partner for personalized healthcare &amp; wellness.</p>
            </div>
            <div className="col-md-2 mb-4">
              <h6 className="mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li><a href="#hero" className="text-light text-decoration-none footer-link">Home</a></li>
                <li><a href="#features" className="text-light text-decoration-none footer-link">Features</a></li>
                <li><a href="#services" className="text-light text-decoration-none footer-link">Services</a></li>
                <li><a href="#contact" className="text-light text-decoration-none footer-link">Contact</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-4">
              <h6 className="mb-3">Contact Us</h6>
              <p>Email: <a href="mailto:info@medoraai.com" className="text-light text-decoration-none footer-link">info@medoraai.com</a></p>
              <p>Phone: <a href="tel:+11111111111" className="text-light text-decoration-none footer-link">+11111111111</a></p>
            </div>
            <div className="col-md-3 mb-4 text-center text-md-end">
              <h6 className="mb-3">Follow Us</h6>
              <a href="#" className="text-light me-3 footer-icon" aria-label="Facebook"><i className="bi bi-facebook fs-4"></i></a>
              <a href="#" className="text-light me-3 footer-icon" aria-label="Twitter"><i className="bi bi-twitter fs-4"></i></a>
              <a href="#" className="text-light me-3 footer-icon" aria-label="Instagram"><i className="bi bi-instagram fs-4"></i></a>
              <a href="#" className="text-light footer-icon" aria-label="LinkedIn"><i className="bi bi-linkedin fs-4"></i></a>
            </div>
          </div>
          <hr className="border-light" />
          <div className="text-center small">&copy; {new Date().getFullYear()} Medora AI Healthcare. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
