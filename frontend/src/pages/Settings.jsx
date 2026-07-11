import SettingsHeader from "../components/settings/SettingsHeader";
import ProfileCard from "../components/settings/ProfileCard";
import AppearanceCard from "../components/settings/AppearanceCard";
import NotificationCard from "../components/settings/NotificationCard";
import SecurityCard from "../components/settings/SecurityCard";
import SystemCard from "../components/settings/SystemCard";
import AboutCard from "../components/settings/AboutCard";

function Settings() {
  return (
    <div className="space-y-6">

      <SettingsHeader />

      <div className="grid gap-6 xl:grid-cols-2">

        <ProfileCard />

        <AppearanceCard />

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <NotificationCard />

        <SecurityCard />

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <SystemCard />

        <AboutCard />

      </div>

    </div>
  );
}

export default Settings;