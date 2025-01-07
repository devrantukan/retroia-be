import { Accordion, AccordionItem } from "@nextui-org/react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";

export default function DescriptorsAccordion({
  descriptorsGrouped,
}: {
  descriptorsGrouped: Record<string, any[]>;
}) {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <Accordion
      defaultExpandedKeys={
        Object.keys(descriptorsGrouped).length >= 2 ? ["1"] : ["0"]
      }
    >
      {Object.entries(descriptorsGrouped).map(([category, group], index) => (
        <AccordionItem
          key={index}
          aria-label={`Accordion ${index}`}
          subtitle="Lütfen tıklayınız"
          title={category}
          className="font-bold"
        >
          <div className="grid lg:grid-cols-3 grid-cols-1 mx-6 mb-4">
            {group.map((item, index) => (
              <li className="flex flex-row mt-1 mb-1" key={index}>
                <p className="mr-2 font-light">{item.descriptor}</p>
                <CheckCircle fill="green" size={24} />
              </li>
            ))}
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
