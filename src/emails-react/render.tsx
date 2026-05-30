import type { ReactElement } from "react";
import { render, toPlainText } from "@react-email/render";

import {
  emailTemplateSampleProps,
  getEmailTemplateDefinition,
  type EmailBlock,
  type EmailCta,
  type EmailTemplateSlug,
  type TemplateProps,
} from "@/emails-react/catalog";
import {
  EmailAlert,
  EmailFrame,
  EmailList,
  EmailTable,
  EmailText,
} from "@/emails-react/EmailFrame";

type AnyTemplateProps = Record<string, string | undefined>;

function inject(value: string, props: AnyTemplateProps) {
  return value.replace(/{{\s*([\w]+)\s*}}/g, (_, key: string) => props[key] ?? "");
}

function injectCtas(ctas: readonly EmailCta[] | undefined, props: AnyTemplateProps) {
  return ctas?.map((cta) => ({
    ...cta,
    label: inject(cta.label, props),
    href: inject(cta.href, props),
  }));
}

function renderBlock(block: EmailBlock, props: AnyTemplateProps, tone: "default" | "danger" | "success") {
  if (block.type === "text") {
    return <EmailText key={block.value}>{inject(block.value, props)}</EmailText>;
  }

  if (block.type === "alert") {
    return (
      <EmailAlert key={block.value} tone={tone}>
        {inject(block.value, props)}
      </EmailAlert>
    );
  }

  if (block.type === "legal") {
    return (
      <EmailAlert key={block.value}>
        {inject(block.value, props)}
      </EmailAlert>
    );
  }

  if (block.type === "list") {
    return (
      <EmailList
        key={`${block.title ?? ""}-${block.items.join("|")}`}
        title={block.title ? inject(block.title, props) : undefined}
        items={block.items.map((item) => inject(item, props))}
      />
    );
  }

  return (
    <EmailTable
      key={block.rows.map((row) => row.label).join("|")}
      rows={block.rows.map((row) => ({
        label: inject(row.label, props),
        value: inject(row.value, props),
      }))}
    />
  );
}

export function renderTemplateComponent<TSlug extends EmailTemplateSlug>(
  slug: TSlug,
  templateProps: TemplateProps<TSlug>,
): ReactElement {
  const definition = getEmailTemplateDefinition(slug);
  const props = {
    ...emailTemplateSampleProps[slug],
    ...templateProps,
  } as AnyTemplateProps;
  const companyName = props.companyName || "CircleWorks";
  const tone = definition.tone ?? "default";

  return (
    <EmailFrame
      companyName={companyName}
      preview={inject(definition.preheader, props)}
      eyebrow={definition.eyebrow ?? definition.category}
      title={inject(definition.title, props)}
      tone={tone}
      ctas={injectCtas(definition.ctas, props)}
    >
      {definition.blocks.map((block) => renderBlock(block, props, tone))}
    </EmailFrame>
  );
}

export async function renderCircleWorksEmail<TSlug extends EmailTemplateSlug>({
  template,
  props,
}: {
  template: TSlug;
  props: TemplateProps<TSlug>;
}) {
  const definition = getEmailTemplateDefinition(template);
  const mergedProps = {
    ...emailTemplateSampleProps[template],
    ...props,
  } as AnyTemplateProps;
  const subject = inject(definition.subject, mergedProps);
  const component = renderTemplateComponent(template, mergedProps as TemplateProps<TSlug>);
  const html = await render(component);

  return {
    template: definition,
    subject,
    html,
    text: toPlainText(html),
  };
}

export function getSampleTemplateProps<TSlug extends EmailTemplateSlug>(slug: TSlug): TemplateProps<TSlug> {
  return emailTemplateSampleProps[slug] as TemplateProps<TSlug>;
}
