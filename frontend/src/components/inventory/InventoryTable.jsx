import InventoryRow from "./InventoryRow";

function InventoryTable({ inventory, onAddStock, onRemoveStock }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Product ID</th>
            <th className="p-4 text-left">Quantity</th>
            <th className="p-4 text-left">Minimum</th>
            <th className="p-4 text-left">Reorder</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {inventory.map((item) => (
            <InventoryRow
              key={item.id}
              item={item}
              onAddStock={onAddStock}
              onRemoveStock={onRemoveStock}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;