# Database Schema: Structured Cost Model

This document outlines the new, machine-readable structure for the `costModel` object within our tool profiles.

## `costModel` Object Fields

- **`type`** (String): The primary pricing model.
  - *Enum values:* `"Free"`, `"Subscription"`, `"Pay-as-you-go"`, `"Custom"`
- **`base_cost_monthly`** (Number): The flat monthly fee for the service (e.g., 20 for a $20/month subscription). Defaults to 0.
- **`unit_cost`** (Number, Optional): The cost per unit for pay-as-you-go models.
- **`unit_type`** (String, Optional): The unit being measured for pay-as-you-go models (e.g., "per_1k_tokens", "per_user").
- **`free_tier_details`** (String, Optional): A human-readable description of any free tier available (e.g., "First 500k tokens free").
- **`link`** (String, Optional): A direct URL to the tool's pricing page.

## Examples

### Pay-as-you-go Model (OpenAI GPT-4):
```json
"costModel": {
  "type": "Pay-as-you-go",
  "base_cost_monthly": 0,
  "unit_cost": 0.03,
  "unit_type": "per_1k_tokens_input",
  "free_tier_details": "No free tier for GPT-4 API.",
  "link": "https://openai.com/pricing"
}
```

### Subscription Model (GitHub Copilot):
```json
"costModel": {
  "type": "Subscription",
  "base_cost_monthly": 10,
  "unit_type": "per_user_per_month",
  "free_tier_details": "Free for verified students and maintainers of popular open-source projects.",
  "link": "https://github.com/features/copilot#pricing"
}
```

### Free Model (React):
```json
"costModel": {
  "type": "Free",
  "base_cost_monthly": 0,
  "free_tier_details": "Open source framework, completely free to use.",
  "link": "https://react.dev"
}
```

### Custom Model (Enterprise):
```json
"costModel": {
  "type": "Custom",
  "base_cost_monthly": 0,
  "free_tier_details": "Contact sales for enterprise pricing",
  "link": "https://example.com/enterprise"
}
```

## Migration Strategy

1. **Update existing tool profiles** to use the new structured costModel
2. **Maintain backward compatibility** by keeping the old text-based descriptions as fallbacks
3. **Gradually enhance** cost models with more detailed pricing information
4. **Validate** all cost data with official pricing pages

## Cost Calculation Rules

- **Free**: Always $0
- **Subscription**: Use `base_cost_monthly` directly
- **Pay-as-you-go**: Use `base_cost_monthly` + note about variable costs
- **Custom**: $0 with note to contact sales

## Data Quality Guidelines

- **Accuracy**: All pricing data must be verified against official sources
- **Currency**: All costs in USD
- **Frequency**: Monthly basis for consistency
- **Updates**: Regular review and updates as pricing changes
