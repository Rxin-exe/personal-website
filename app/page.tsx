import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Breakdowns from "@/components/Breakdowns";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Experience />
        <Projects />
        <Breakdowns />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
