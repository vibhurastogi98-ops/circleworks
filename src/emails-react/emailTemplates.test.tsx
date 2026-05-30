import { describe, expect, it } from "vitest";

import {
  emailTemplateDefinitions,
  emailTemplateSampleProps,
  renderCircleWorksEmail,
  type EmailTemplateSlug,
} from "@/emails-react";

function expectedFragments(value: unknown) {
  if (typeof value !== "string") return [];
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

describe("CircleWorks React Email templates", () => {
  it("registers all 45 Prompt 26 templates", () => {
    expect(emailTemplateDefinitions).toHaveLength(45);
    expect(new Set(emailTemplateDefinitions.map((definition) => definition.slug)).size).toBe(45);
  });

  it.each(emailTemplateDefinitions)("$slug renders required props and valid links", async (definition) => {
    const props = emailTemplateSampleProps[definition.slug as EmailTemplateSlug];
    const rendered = await renderCircleWorksEmail({
      template: definition.slug,
      props,
    });

    expect(rendered.subject).not.toContain("{{");
    expect(rendered.html).not.toContain("{{");
    expect(rendered.html).toContain("CircleWorks");
    expect(rendered.html).toContain("548 Market St, San Francisco, CA 94104");
    expect(rendered.html).not.toMatch(/href=["'](?:|#)["']/);

    for (const key of definition.requiredProps) {
      for (const fragment of expectedFragments(props[key as keyof typeof props])) {
        expect(rendered.html).toContain(fragment);
      }
    }

    for (const cta of definition.ctas ?? []) {
      const propName = cta.href.match(/{{\s*([\w]+)\s*}}/)?.[1];
      if (propName) {
        expect(rendered.html).toContain(String(props[propName as keyof typeof props]));
      }
    }
  });
});
