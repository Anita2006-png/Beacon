import { getOwnMedicalProfileDecrypted } from "@/lib/medical";
import { ProfileForm } from "@/components/patient/profile-form";

export default async function ProfileEditPage() {
  const profile = await getOwnMedicalProfileDecrypted();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <header className="beacon-rise mb-7">
        <span className="data-label text-primary-400">
          {profile ? "Editing" : "New passport"}
        </span>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
          {profile ? "Your details" : "Create your health passport"}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          This is what a responder sees in an emergency. Your allergies,
          medications, and conditions are encrypted before they&apos;re stored.
        </p>
      </header>
      <ProfileForm initial={profile} />
    </div>
  );
}
