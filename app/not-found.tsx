import type { Metadata } from "next";
import DitherScene from "@/components/DitherScene";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import WipeLink from "@/components/WipeLink";

export const metadata: Metadata = { title: "Page not found" };

/** 404: the camp at night, and the climber has come off the wall onto the pad. */
export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="contact-wrap lost">
        <DitherScene scene="fallen" className="contact-scene" />
        <div className="container contact">
          <h1 className="section-title">Came off the wall.</h1>
          <p className="section-intro">There&apos;s nothing at this address. It may have moved, or the link has a typo.</p>
          <div className="contact-email">
            <WipeLink href="/" className="btn btn-primary btn-lg">
              Back to the homepage
            </WipeLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
