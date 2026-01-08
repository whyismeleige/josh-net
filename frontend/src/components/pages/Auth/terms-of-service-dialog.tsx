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

export function TermsOfServiceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="cursor-pointer underline-offset-4 underline">
          Terms of Service
        </span>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>Last updated: January 09, 2026</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-semibold text-base mb-2">
                1. Acceptance of Terms
              </h3>
              <p className="text-muted-foreground">
                By accessing and using JOSH-Net, you accept and agree to be
                bound by the terms and provision of this agreement. If you do
                not agree to these Terms of Service, please do not use the
                platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                2. Description of Service
              </h3>
              <p className="text-muted-foreground">
                JOSH-Net is a comprehensive digital platform designed for
                students of St. Joseph's Degree and PG College. The platform
                provides:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Academic resource management and sharing</li>
                <li>Attendance and performance tracking</li>
                <li>Real-time communication through servers and channels</li>
                <li>AI-powered academic assistance via Josephine chatbot</li>
                <li>Student collaboration and networking features</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">3. User Accounts</h3>
              <p className="text-muted-foreground mb-2">
                To use JOSH-Net, you must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  Be a current student, faculty, or authorized personnel of St.
                  Joseph's College
                </li>
                <li>
                  Use your official college email address
                  (@josephscollege.ac.in)
                </li>
                <li>
                  Provide accurate and complete information during registration
                </li>
                <li>Maintain the security of your password and account</li>
                <li>Not share your account credentials with others</li>
                <li>
                  Notify us immediately of any unauthorized use of your account
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">4. User Conduct</h3>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>
                  Upload or share content that is illegal, harmful, threatening,
                  abusive, or offensive
                </li>
                <li>Impersonate any person or entity</li>
                <li>Violate any intellectual property rights</li>
                <li>Transmit viruses or malicious code</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>
                  Use the platform for commercial purposes without authorization
                </li>
                <li>Harass, bully, or discriminate against other users</li>
                <li>
                  Share exam questions or answers that violate academic
                  integrity
                </li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                5. Content and Materials
              </h3>
              <p className="text-muted-foreground mb-2">
                All study materials, lecture notes, and academic resources
                shared on JOSH-Net are for educational purposes only. Users
                must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Respect copyright and intellectual property rights</li>
                <li>Only upload materials they have the right to share</li>
                <li>
                  Give proper attribution when sharing third-party content
                </li>
                <li>Not use materials for commercial purposes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                6. AI Assistance (Josephine)
              </h3>
              <p className="text-muted-foreground">
                The Josephine AI chatbot is provided for educational support.
                While we strive for accuracy, the AI may occasionally provide
                incorrect or incomplete information. Users should verify
                important information independently and not rely solely on AI
                responses for critical academic decisions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                7. Privacy and Data
              </h3>
              <p className="text-muted-foreground">
                Your use of JOSH-Net is also governed by our Privacy Policy. We
                collect and process data as described in the Privacy Policy to
                provide and improve our services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">8. Termination</h3>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend your account
                immediately, without prior notice or liability, for any reason,
                including breach of these Terms. Upon termination, your right to
                use the platform will cease immediately.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                9. Changes to Terms
              </h3>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. We will
                notify users of any material changes via email or platform
                notification. Continued use of the platform after changes
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">10. Disclaimer</h3>
              <p className="text-muted-foreground">
                JOSH-Net is provided "as is" without warranties of any kind. We
                do not guarantee that the platform will be error-free, secure,
                or continuously available. We are not responsible for any data
                loss or unauthorized access.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                11. Limitation of Liability
              </h3>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, JOSH-Net and its
                developers shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your
                use of the platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">
                12. Contact Information
              </h3>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us
                at:
              </p>
              <ul className="text-muted-foreground mt-2 space-y-1">
                <li>Email: pjain.work@proton.me</li>
                <li>Email: bobbyanthene@gmail.com</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
