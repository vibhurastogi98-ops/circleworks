import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import type { EmailCta, EmailTone } from "@/emails-react/catalog";

const colors = {
  navy: "#0A1628",
  blue: "#2563EB",
  gray50: "#F8FAFC",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  red: "#DC2626",
  redBg: "#FEF2F2",
  green: "#059669",
  greenBg: "#ECFDF5",
};

const bodyStyle = {
  margin: "0",
  backgroundColor: colors.gray50,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const outerStyle = {
  width: "100%",
  backgroundColor: colors.gray50,
  padding: "24px 0",
};

const containerStyle = {
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#FFFFFF",
};

const headerStyle = {
  height: "64px",
  backgroundColor: colors.navy,
  padding: "0 24px",
};

const bodyContentStyle = {
  backgroundColor: "#FFFFFF",
  padding: "32px",
};

const footerStyle = {
  backgroundColor: colors.gray100,
  padding: "16px 24px",
};

const footerTextStyle = {
  margin: "0",
  color: colors.gray500,
  fontSize: "12px",
  lineHeight: "18px",
  textAlign: "center" as const,
};

const logoBadgeStyle = {
  display: "inline-block",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  backgroundColor: "#FFFFFF",
  color: colors.navy,
  fontSize: "13px",
  fontWeight: "800",
  lineHeight: "32px",
  textAlign: "center" as const,
  marginRight: "10px",
};

const logoTextStyle = {
  color: "#FFFFFF",
  display: "inline-block",
  fontSize: "18px",
  fontWeight: "800",
  lineHeight: "32px",
  verticalAlign: "top",
};

const companyStyle = {
  color: "#CBD5E1",
  fontSize: "13px",
  fontWeight: "700",
  textAlign: "right" as const,
};

const eyebrowStyle = {
  margin: "0 0 12px",
  color: colors.blue,
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0",
  textTransform: "uppercase" as const,
};

const titleStyle = {
  margin: "0 0 16px",
  color: colors.gray900,
  fontSize: "28px",
  lineHeight: "34px",
  fontWeight: "800",
};

const textStyle = {
  margin: "0 0 16px",
  color: colors.gray700,
  fontSize: "16px",
  lineHeight: "24px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  margin: "18px 0 22px",
};

const tableCellStyle = {
  borderBottom: `1px solid ${colors.gray200}`,
  padding: "10px 0",
  fontSize: "14px",
  lineHeight: "20px",
};

const labelCellStyle = {
  ...tableCellStyle,
  color: colors.gray500,
  fontWeight: "700",
};

const valueCellStyle = {
  ...tableCellStyle,
  color: colors.gray900,
  fontWeight: "800",
  textAlign: "right" as const,
};

const alertStyles: Record<EmailTone, Record<string, string>> = {
  default: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    color: "#1D4ED8",
  },
  danger: {
    backgroundColor: colors.redBg,
    borderColor: "#FECACA",
    color: colors.red,
  },
  success: {
    backgroundColor: colors.greenBg,
    borderColor: "#A7F3D0",
    color: colors.green,
  },
};

function ctaStyle(tone: EmailCta["tone"]) {
  if (tone === "danger") {
    return {
      backgroundColor: colors.red,
      color: "#FFFFFF",
    };
  }

  if (tone === "secondary") {
    return {
      backgroundColor: "#E5E7EB",
      color: colors.gray900,
    };
  }

  return {
    backgroundColor: colors.blue,
    color: "#FFFFFF",
  };
}

export function EmailFrame({
  companyName,
  preview,
  eyebrow,
  title,
  tone = "default",
  children,
  ctas,
}: {
  companyName: string;
  preview: string;
  eyebrow: string;
  title: string;
  tone?: EmailTone;
  children: ReactNode;
  ctas?: readonly EmailCta[];
}) {
  const toneStyle = alertStyles[tone];

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Section style={outerStyle}>
          <Container style={containerStyle}>
            <Section style={headerStyle}>
              <Row style={{ height: "64px" }}>
                <Column>
                  <span style={logoBadgeStyle}>CW</span>
                  <span style={logoTextStyle}>CircleWorks</span>
                </Column>
                <Column style={companyStyle}>{companyName}</Column>
              </Row>
            </Section>

            {tone !== "default" ? (
              <Section
                style={{
                  backgroundColor: toneStyle.backgroundColor,
                  borderBottom: `1px solid ${toneStyle.borderColor}`,
                  padding: "14px 32px",
                }}
              >
                <Text
                  style={{
                    margin: "0",
                    color: toneStyle.color,
                    fontSize: "13px",
                    fontWeight: "800",
                    lineHeight: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  {tone === "danger" ? "Action required" : "Confirmed"}
                </Text>
              </Section>
            ) : null}

            <Section style={bodyContentStyle}>
              <Text style={eyebrowStyle}>{eyebrow}</Text>
              <Heading as="h1" style={titleStyle}>
                {title}
              </Heading>
              {children}
              {ctas?.length ? (
                <Section style={{ marginTop: "24px", textAlign: "center" }}>
                  {ctas.map((cta) => (
                    <Button
                      key={`${cta.label}-${cta.href}`}
                      href={cta.href}
                      style={{
                        ...ctaStyle(cta.tone),
                        borderRadius: "8px",
                        display: "inline-block",
                        fontSize: "16px",
                        fontWeight: "800",
                        height: "48px",
                        lineHeight: "48px",
                        margin: "0 6px 12px",
                        padding: "0 22px",
                        textDecoration: "none",
                      }}
                    >
                      {cta.label}
                    </Button>
                  ))}
                </Section>
              ) : null}
            </Section>

            <Hr style={{ borderColor: colors.gray200, margin: "0" }} />
            <Section style={footerStyle}>
              <Text style={footerTextStyle}>
                © 2026 CircleWorks Inc. ·{" "}
                <Link href="https://app.circleworks.com/settings/notifications" style={{ color: colors.gray500 }}>
                  Unsubscribe
                </Link>{" "}
                ·{" "}
                <Link href="https://circleworks.com/legal/privacy" style={{ color: colors.gray500 }}>
                  Privacy Policy
                </Link>{" "}
                · 548 Market St, San Francisco, CA 94104
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}

export function EmailText({ children }: { children: ReactNode }) {
  return <Text style={textStyle}>{children}</Text>;
}

export function EmailAlert({ children, tone = "default" }: { children: ReactNode; tone?: EmailTone }) {
  const toneStyle = alertStyles[tone];
  return (
    <Section
      style={{
        backgroundColor: toneStyle.backgroundColor,
        border: `1px solid ${toneStyle.borderColor}`,
        borderRadius: "8px",
        margin: "16px 0",
        padding: "14px 16px",
      }}
    >
      <Text
        style={{
          margin: "0",
          color: toneStyle.color,
          fontSize: "15px",
          fontWeight: "800",
          lineHeight: "22px",
        }}
      >
        {children}
      </Text>
    </Section>
  );
}

export function EmailTable({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <table style={tableStyle}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td style={labelCellStyle}>{row.label}</td>
            <td style={valueCellStyle}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EmailList({ title, items }: { title?: string; items: string[] }) {
  const expanded = items.flatMap((item) =>
    item.includes(";")
      ? item.split(";").map((part) => part.trim()).filter(Boolean)
      : [item],
  );

  return (
    <Section style={{ margin: "16px 0" }}>
      {title ? (
        <Text
          style={{
            margin: "0 0 8px",
            color: colors.gray900,
            fontSize: "15px",
            fontWeight: "800",
            lineHeight: "22px",
          }}
        >
          {title}
        </Text>
      ) : null}
      {expanded.map((item) => (
        <Text key={item} style={{ ...textStyle, margin: "0 0 8px" }}>
          • {item}
        </Text>
      ))}
    </Section>
  );
}
