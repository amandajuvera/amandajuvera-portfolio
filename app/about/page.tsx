import Image from "next/image";
import type { Metadata } from "next";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "About — Amanda Juvera" };

export default function AboutPage() {
  return (
    <>
      <Masthead current="/about" label="About" />

      <main className="about-hero">
        <div className="about-hero__text">
          <div className="prose">
            <p>
              Hey, I&apos;m Amanda! I am a senior at the University of Michigan
              studying Computer Science (B.S.) I have lived in California, New
              Jersey, Texas, Georgia, and Arizona.
            </p>
            <p>
              I have experience in software engineering at Oracle Cloud
              Infrastructure.
            </p>
            <p>
              I am passionate about building software with a user-centric
              mindset.
            </p>
            <p>[Paragraph three.]</p>
            <p>
              In my free time, I like to read, draw, weight-lift, hike, and
              travel.
            </p>
            <p>
              Reach me at{" "}
              <a href="mailto:ajuvera@umich.edu">ajuvera@umich.edu</a>.
            </p>

            <figure
              className="media-box media-box--wide"
              style={{ maxWidth: "14rem", marginTop: "2.5rem" }}
            >
              <Image
                src="/images/swans.png"
                alt="Line drawing of two swans forming a heart shape"
                fill
                sizes="14rem"
              />
            </figure>
          </div>
        </div>

        <div className="about-media">
          <div className="about-media__top">
            <figure className="media-box media-box--flower">
              <Image
                src="/images/flower.png"
                alt="Pressed flower"
                fill
                sizes="(min-width: 55rem) 30vw, 100vw"
              />
            </figure>
            <figure className="media-box media-box--lace">
              <Image
                src="/images/lace.png"
                alt="Black lace trim"
                fill
                sizes="(min-width: 55rem) 10vw, 25vw"
              />
            </figure>
          </div>
          <figure className="portrait">
            <Image
              src="/images/portrait.jpg"
              alt="Amanda Juvera"
              fill
              sizes="(min-width: 55rem) 38vw, 100vw"
            />
          </figure>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
