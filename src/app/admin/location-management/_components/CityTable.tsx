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
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  page: number;
  total: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
};

export default function CityTable({
  data,
  onAdd,
  onEdit,
  onDelete,
  page,
  total,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: Props) {
  return (
    <div className="mt-4">
      <div className="flex justify-end mb-4">
        <Button color="primary" onPress={onAdd}>
          Yeni Ekle
        </Button>
      </div>

      <Table aria-label="Cities table">
        <TableHeader>
          <TableColumn>Şehir Adı</TableColumn>
          <TableColumn>Ülke</TableColumn>
          <TableColumn>Slug</TableColumn>
          <TableColumn>İşlemler</TableColumn>
        </TableHeader>
        <TableBody>
          {data.map((city) => (
            <TableRow key={city.city_id}>
              <TableCell>{city.city_name}</TableCell>
              <TableCell>{city.country_name}</TableCell>
              <TableCell>{city.slug}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => onEdit(city)}
                  >
                    <PencilSimple size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => onDelete(city.city_id)}
                  >
                    <Trash size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex w-full justify-between items-center mt-4">
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
    </div>
  );
}
