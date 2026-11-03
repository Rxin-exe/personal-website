import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import Projects from "@/components/Projects";
import Breakdowns from "@/components/Breakdowns";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CommandMenu from "@/components/CommandMenu";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Timeline />
        <Projects />
        <Breakdowns />
        <Contact />
      </main>
      <Footer />
      <CommandMenu />
    </>
  );
}
