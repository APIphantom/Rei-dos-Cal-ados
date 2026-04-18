import { getHeroSettings } from "@/lib/site-settings";
import { HomeHeroClient } from "@/components/home/HomeHeroClient";

export async function HomeHero() {
  const hero = await getHeroSettings();
  return <HomeHeroClient hero={hero} interactive={true} editable={false} />;
}
