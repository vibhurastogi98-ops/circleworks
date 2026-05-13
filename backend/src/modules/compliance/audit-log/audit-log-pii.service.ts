import { Injectable } from '@nestjs/common';

export type AuditLogViewerRole = string | undefined | null;

export const PII_FIELDS = [
  'ssn',
  'tax_id',
  'taxId',
  'ein',
  'bank_routing',
  'bankRouting',
  'routingNumber',
  'bank_account',
  'bankAccount',
  'bankAccountNumber',
  'accountNumber',
  'salary',
  'compensation',
  'payRate',
  'baseSalary',
  'password',
] as const;

const SENSITIVE_DISPLAY_PLACEHOLDER = '[Sensitive field — masked]';

@Injectable()
export class AuditLogPiiService {
  maskPIIForAuditLog(fieldName: string, value: unknown, userRole?: AuditLogViewerRole) {
    if (!this.isSensitiveField(fieldName)) {
      return this.stringifyValue(value);
    }

    const normalizedField = this.normalizeFieldName(fieldName);

    if (normalizedField === 'password') {
      return 'Password changed';
    }

    if (this.isCompensationField(normalizedField)) {
      return this.canViewCompensationAmounts(userRole)
        ? this.formatCompensationValue(value)
        : 'Compensation updated';
    }

    if (this.isSsnOrTaxId(normalizedField)) {
      return this.maskWithPattern(value, '***-**-');
    }

    if (this.isBankField(normalizedField)) {
      return this.maskWithPattern(value, '***');
    }

    return SENSITIVE_DISPLAY_PLACEHOLDER;
  }

  maskChangeForAuditLog(fieldName: string, oldValue: unknown, newValue: unknown, userRole?: AuditLogViewerRole) {
    const normalizedField = this.normalizeFieldName(fieldName);

    if (normalizedField === 'password') {
      return {
        oldValue: 'Password changed',
        newValue: 'Password changed',
        displayValue: 'Password changed',
      };
    }

    if (this.isCompensationField(normalizedField)) {
      if (this.canViewCompensationAmounts(userRole)) {
        return {
          oldValue: this.formatCompensationValue(oldValue),
          newValue: this.formatCompensationValue(newValue),
          displayValue: `Updated from ${this.formatCompensationValue(oldValue)} to ${this.formatCompensationValue(newValue)}`,
        };
      }

      return {
        oldValue: 'Compensation updated',
        newValue: 'Compensation updated',
        displayValue: 'Compensation updated',
      };
    }

    return {
      oldValue: this.maskPIIForAuditLog(fieldName, oldValue, userRole),
      newValue: this.maskPIIForAuditLog(fieldName, newValue, userRole),
      displayValue: undefined,
    };
  }

  maskForAuditLogDisplay(fieldName: string, storedValue: unknown, viewerRole?: AuditLogViewerRole) {
    if (!this.isSensitiveField(fieldName)) {
      return this.stringifyValue(storedValue);
    }

    if (!this.canViewMaskedSensitiveValues(viewerRole)) {
      return SENSITIVE_DISPLAY_PLACEHOLDER;
    }

    return this.stringifyValue(storedValue);
  }

  isSensitiveField(fieldName: string) {
    const normalizedField = this.normalizeFieldName(fieldName);
    return PII_FIELDS.some((field) => this.normalizeFieldName(field) === normalizedField);
  }

  canViewMaskedSensitiveValues(role?: AuditLogViewerRole) {
    const normalizedRole = this.normalizeRole(role);
    return normalizedRole === 'admin' || normalizedRole === 'hr';
  }

  private canViewCompensationAmounts(role?: AuditLogViewerRole) {
    return this.canViewMaskedSensitiveValues(role);
  }

  private isCompensationField(fieldName: string) {
    return ['salary', 'compensation', 'payrate', 'basesalary'].includes(fieldName);
  }

  private isSsnOrTaxId(fieldName: string) {
    return ['ssn', 'taxid', 'ein'].includes(fieldName);
  }

  private isBankField(fieldName: string) {
    return ['bankrouting', 'routingnumber', 'bankaccount', 'bankaccountnumber', 'accountnumber'].includes(fieldName);
  }

  private maskWithPattern(value: unknown, prefix: string) {
    const digits = this.stringifyValue(value).replace(/\D/g, '');
    const lastFour = digits.slice(-4).padStart(4, '*');
    return `${prefix}${lastFour}`;
  }

  private formatCompensationValue(value: unknown) {
    if (value === null || value === undefined || value === '') return '$0';

    const numericValue = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(numericValue)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(numericValue);
    }

    return this.stringifyValue(value);
  }

  private stringifyValue(value: unknown) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }

  private normalizeFieldName(fieldName: string) {
    return fieldName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  private normalizeRole(role?: AuditLogViewerRole) {
    return String(role || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
}

export { SENSITIVE_DISPLAY_PLACEHOLDER };
