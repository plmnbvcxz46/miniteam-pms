import { FormChoiceShowcase } from "./FormChoiceShowcase";
import { FormFieldShowcase } from "./FormFieldShowcase";
import { FormSwitchShowcase } from "./FormSwitchShowcase";
import { FormTextShowcase } from "./FormTextShowcase";

export function FormShowcase() {
  return (
    <>
      <FormTextShowcase />
      <FormSwitchShowcase />
      <FormChoiceShowcase />
      <FormFieldShowcase />
    </>
  );
}
