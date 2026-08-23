import Image from "next/image";
import { Masthead } from "@/components/Masthead";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <Masthead current="/" />

      <main className="cover-split">
        <figure className="cover-split__image">
          <Image
            src="/images/window-view.jpg"
            alt="View through a window overlooking a European city square"
            fill
            priority
            sizes="50vw"
          />
        </figure>
        <h1 className="cover-name-script rise">Amanda Juvera</h1>
      </main>

      <SiteFooter flush />
    </>
  );
}
