import { getHeroSettings } from "@/lib/site-settings";
import { CustomizeWorkspace } from "@/components/admin/CustomizeWorkspace";

export default async function AdminCustomizePage() {
  const hero = await getHeroSettings();
  return <CustomizeWorkspace heroMedia={hero} />;
}
