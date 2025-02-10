import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { PencilSimple, Trash } from "@phosphor-icons/react";

type Props = {
  data: any[];
  columns: string[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  page: number;
  total: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

export default function LocationTable({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  page,
  total,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  // Debug logs
  console.log("Columns:", columns);
  console.log("Data:", data);

  return (
    <div className="mt-4">
      <div className="flex justify-end mb-4">
        <Button color="primary" onPress={onAdd}>
          Yeni Ekle
        </Button>
      </div>

      <Table
        aria-label="Location table"
        bottomContent={
          <div className="flex w-full justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Sayfa başına:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                className="border rounded p-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                isDisabled={page === 1}
                onPress={() => onPageChange(page - 1)}
              >
                Önceki
              </Button>
              <Button
                isDisabled={page >= Math.ceil(total / rowsPerPage)}
                onPress={() => onPageChange(page + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        }
      >
        <TableHeader>
          <TableColumn>
            {columns.join(" | ")}
            {" | "}
            İŞLEMLER
          </TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((item: any) => (
            <TableRow
              key={
                item.id ||
                item.country_id ||
                item.city_id ||
                item.district_id ||
                item.neighborhood_id
              }
            >
              <TableCell>
                <div className="grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))_auto] gap-4 items-center">
                  {columns.map((column) => {
                    const key = column.toLowerCase().replace(/\s+/g, "_");
                    let value = "";

                    switch (key) {
                      case "ülke_adı":
                        value = item.country_name;
                        break;
                      case "şehir_adı":
                        value = item.city_name;
                        break;
                      case "ilçe_adı":
                        value = item.district_name;
                        break;
                      case "mahalle_adı":
                        value = item.neighborhood_name;
                        break;
                      case "slug":
                        value = item.slug;
                        break;
                      default:
                        value = item[key] || "-";
                    }

                    return <div key={column}>{value}</div>;
                  })}
                  <div className="flex gap-2 justify-end">
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={() => onEdit(item)}
                    >
                      <PencilSimple size={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => onDelete(item.id)}
                    >
                      <Trash size={20} />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
