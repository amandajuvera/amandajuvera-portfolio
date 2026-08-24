import Image from "next/image";
import { BottomNav } from "@/components/BottomNav";

export default function HomePage() {
  return (
    <main className="cover">
      <figure className="cover__photo">
        <Image
          src="/images/window-view.jpg"
          alt="View through a window overlooking Prague's old town square"
          fill
          priority
          sizes="100vw"
        />
      </figure>

      {/* Sits above the photo/band seam so the descenders fall into the red. */}
      <h1 className="cover__name">Amanda Juvera</h1>

      <BottomNav current="/" tone="light" />
    </main>
  );
}
