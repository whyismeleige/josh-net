"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/ui/dialog";

export function PrivacyPolicyDialog() {
  return (
    <Dialog>
        <DialogTrigger asChild>
            <span className="cursor-pointer underline-offset-4 underline">Privacy Policy</span>
        </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>Last updated: January 09, 2026</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
              <p className="text-muted-foreground">
                JOSH-Net ("we", "our", or "us") respects your privacy and is
                committed to protecting your personal data. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                2. Information We Collect
              </h3>

              <h4 className="font-medium mt-3 mb-2">
                2.1 Personal Information
              </h4>
              <p className="text-muted-foreground mb-2">
                When you register and use JOSH-Net, we collect:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Name and email address (college email)</li>
                <li>Student ID or employee ID</li>
                <li>Course and academic information</li>
                <li>Phone number (optional)</li>
                <li>Profile picture (optional)</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">2.2 Academic Data</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Attendance records</li>
                <li>Examination results and grades</li>
                <li>Course enrollment information</li>
                <li>Academic performance metrics</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">2.3 Usage Information</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Files and materials you upload or download</li>
                <li>Messages and communications within the platform</li>
                <li>Server and channel participation</li>
                <li>Josephine AI chat history and interactions</li>
                <li>Login activity and session data</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">
                2.4 Technical Information
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Access times and referring websites</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                3. How We Use Your Information
              </h3>
              <p className="text-muted-foreground mb-2">
                We use your information to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and maintain the platform's functionality</li>
                <li>Authenticate your identity and manage your account</li>
                <li>Display your academic records and performance</li>
                <li>Enable communication and collaboration features</li>
                <li>Provide AI-powered assistance through Josephine</li>
                <li>Send important notifications and updates</li>
                <li>Improve platform features and user experience</li>
                <li>Detect and prevent security issues or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                4. Data Storage and Security
              </h3>

              <h4 className="font-medium mt-3 mb-2">4.1 Storage</h4>
              <p className="text-muted-foreground mb-2">
                Your data is stored using:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>MongoDB for structured data (profiles, messages, etc.)</li>
                <li>AWS S3 for file storage (documents, images)</li>
                <li>Redis for temporary session data</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">4.2 Security Measures</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Encrypted data transmission (HTTPS/TLS)</li>
                <li>Password hashing using bcrypt</li>
                <li>JWT-based authentication with refresh tokens</li>
                <li>Two-factor authentication (2FA) option</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authorization checks</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Information Sharing
              </h3>
              <p className="text-muted-foreground mb-2">
                We share your information only in the following circumstances:
              </p>

              <h4 className="font-medium mt-3 mb-2">5.1 Within the Platform</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  Your name and profile information are visible to other
                  students and faculty
                </li>
                <li>
                  Materials you upload may be visible to your class/course
                  members
                </li>
                <li>Messages in servers and channels are visible to members</li>
                <li>Public chats you share are accessible via link</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">
                5.2 Third-Party Services
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  Anthropic Claude API (for AI assistance - subject to
                  Anthropic's privacy policy)
                </li>
                <li>AWS (for cloud storage and hosting)</li>
                <li>Google OAuth (if you use Google sign-in)</li>
              </ul>

              <h4 className="font-medium mt-3 mb-2">5.3 Legal Requirements</h4>
              <p className="text-muted-foreground">
                We may disclose your information if required by law, court
                order, or to protect the rights, property, or safety of
                JOSH-Net, our users, or others.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                6. Your Rights and Choices
              </h3>
              <p className="text-muted-foreground mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of non-essential notifications</li>
                <li>Control visibility of your shared content</li>
                <li>
                  Disable two-factor authentication (though not recommended)
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. AI Chat Data (Josephine)
              </h3>
              <p className="text-muted-foreground">
                Conversations with Josephine AI are stored to provide context
                and improve your experience. Your chat history is private by
                default but can be made public via share links if you choose. We
                use Anthropic's Claude API, and your queries are processed
                according to Anthropic's privacy practices. We do not use your
                chat data to train AI models.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                8. Data Retention
              </h3>
              <p className="text-muted-foreground">
                We retain your information for as long as your account is active
                or as needed to provide services. Academic records may be
                retained according to college policies. You can request deletion
                of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                9. Cookies and Tracking
              </h3>
              <p className="text-muted-foreground">
                We use cookies and similar technologies for authentication,
                session management, and to remember your preferences. You can
                control cookie settings in your browser, but some features may
                not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                10. Children's Privacy
              </h3>
              <p className="text-muted-foreground">
                JOSH-Net is designed for college students and educational use.
                While some users may be under 18, the platform is intended for
                educational purposes under institutional oversight.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                11. Changes to Privacy Policy
              </h3>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes via email or platform
                notification. Your continued use after changes indicates
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">12. Contact Us</h3>
              <p className="text-muted-foreground mb-2">
                If you have questions about this Privacy Policy or how we handle
                your data, please contact us at:
              </p>
              <ul className="text-muted-foreground space-y-1">
                <li>Email: pjain.work@proton.me</li>
                <li>Email: bobbyanthene@gmail.com</li>
              </ul>
            </section>

            <section className="pt-4 border-t">
              <p className="text-muted-foreground text-xs">
                By using JOSH-Net, you acknowledge that you have read and
                understood this Privacy Policy and agree to its terms.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
