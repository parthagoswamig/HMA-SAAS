'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Table,
  Modal,
  Text,
  Tabs,
  Card,
  ActionIcon,
  Menu,
  Stack,
  Divider,
  SimpleGrid,
  ScrollArea,
  ThemeIcon,
  Progress,
  NumberInput,
  Textarea,
  // Checkbox,
  // Image,
  // Indicator,
  // RingProgress,
  // Box
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import EmptyState from '../../../components/EmptyState';
import { notifications } from '@mantine/notifications';
import {
  MantineDonutChart,
  SimpleBarChart,
  SimpleLineChart,
} from '../../../components/MantineChart';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconEye,
  IconTrash,
  IconPackage,
  IconChartBar,
  // IconPhone,
  // IconMail,
  IconAlertCircle,
  // IconCheck,
  // IconX,
  IconDotsVertical,
  IconDownload,
  // IconPrinter,
  // IconShare,
  // IconFlask,
  IconStethoscope,
  // IconExclamationMark,
  // IconClockHour4,
  // IconTrendingUp,
  // IconTrendingDown,
  // IconUsers,
  IconCalculator,
  // IconWallet,
  IconSettings,
  // IconBuildingWarehouse,
  IconShoppingCart,
  // IconRefresh,
  // IconFilter,
  // IconBarcode,
  // IconTemperature,
  // IconShieldCheck,
  // IconCircleCheck,
  IconClipboard,
} from '@tabler/icons-react';

// Import types, services and mock data
import {
  InventoryItem,
  PurchaseOrder,
  Equipment,
} from '../../../types/inventory';
import inventoryService from '../../../services/inventory.service';
// Mock data imports removed

const InventoryManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // API data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [_loading, _setLoading] = useState(true);
  const [_error, _setError] = useState<string | null>(null);

  // Modal states
  const [itemDetailOpened, { open: openItemDetail, close: closeItemDetail }] = useDisclosure(false);
  const [addItemOpened, { open: openAddItem, close: closeAddItem }] = useDisclosure(false);
  const [orderDetailOpened, { open: openOrderDetail, close: closeOrderDetail }] =
    useDisclosure(false);
  const [_addOrderOpened, { open: _openAddOrder, close: _closeAddOrder }] = useDisclosure(false);
  const [_equipmentDetailOpened, { open: _openEquipmentDetail, close: _closeEquipmentDetail }] =
    useDisclosure(false);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      _setLoading(true);
      _setError(null);
      await Promise.all([fetchInventoryItems(), fetchInventoryStats()]);
    } catch (err: any) {
      console.error('Error loading inventory data:', err);
      _setError(err.response?.data?.message || err.message || 'Failed to load inventory data');
      // Fallback to mock data
      setInventoryItems([] /* TODO: Fetch from API */);
      setInventoryStats([] /* TODO: Fetch from API */);
    } finally {
      _setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const filters = {
        category: selectedCategory || undefined,
        supplier: selectedSupplier || undefined,
        search: searchQuery || undefined,
      };
      const response = await inventoryService.getItems(filters);
      const itemsData = Array.isArray(response.data) ? response.data : response.data?.items || [];
      setInventoryItems(itemsData as InventoryItem[]);
    } catch (err: any) {
      console.warn(
        'Error fetching inventory items (using empty data):',
        err.response?.data?.message || err.message
      );
      setInventoryItems([]);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const response = await inventoryService.getStats();
      setInventoryStats(response.data);
    } catch (err: any) {
      console.warn(
        'Error fetching inventory stats (using default values):',
        err.response?.data?.message || err.message
      );
      setInventoryStats({
        totalItems: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        expiringSoon: 0,
        totalValue: 0,
        categoriesCount: 0,
      });
    }
  };

  // Refetch when filters change
  useEffect(() => {
    if (!_loading) {
      fetchInventoryItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedSupplier]);

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        ((item as any).itemName || (item as any).name || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.itemCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || (item as any).category === selectedCategory;
      const matchesStatus = !selectedStatus || (item as any).status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus, inventoryItems]);

  // Filter purchase orders
  const filteredOrders = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (order) => {
        const matchesSearch =
          ((order as any).orderNumber || order.id || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ((order.supplier as any)?.companyName || (order.supplier as any)?.name || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedStatus || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedStatus]);

  // Filter equipment
  const filteredEquipment = useMemo(() => {
    return [].filter(
      /* TODO: Fetch from API */ (equipment) => {
        const matchesSearch =
          ((equipment as any).equipmentName || equipment.name || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          ((equipment as any).model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          ((equipment as any).serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !selectedStatus || equipment.status === selectedStatus;

        return matchesSearch && matchesStatus;
      }
    );
  }, [searchQuery, selectedStatus]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
      case 'delivered':
      case 'operational':
      case 'available':
        return 'green';
      case 'low_stock':
      case 'pending':
      case 'maintenance':
      case 'in_use':
        return 'orange';
      case 'out_of_stock':
      case 'cancelled':
      case 'out_of_service':
      case 'retired':
        return 'red';
      case 'expired':
      case 'ordered':
        return 'yellow';
      case 'damaged':
        return 'dark';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medication':
        return 'blue';
      case 'medical_supplies':
        return 'green';
      case 'surgical_instruments':
        return 'purple';
      case 'laboratory':
        return 'orange';
      case 'radiology':
        return 'cyan';
      case 'consumables':
        return 'yellow';
      case 'equipment':
        return 'red';
      case 'medicines':
        return 'blue';
      case 'supplies':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'orange';
      case 'expired':
        return 'red';
      case 'expiring_soon':
        return 'yellow';
      case 'out_of_stock':
        return 'red';
      case 'maintenance_due':
        return 'blue';
      case 'overdue_order':
        return 'red';
      case 'reorder':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    setSelectedItem(item);
    openItemDetail();
  };

  const handleViewOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    openOrderDetail();
  };

  const _handleViewEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    _openEquipmentDetail();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedSupplier('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStockLevel = (current: number, minimum: number, maximum: number) => {
    if (current === 0) return { level: 'Out of Stock', color: 'red', percentage: 0 };
    if (current <= minimum)
      return { level: 'Low Stock', color: 'orange', percentage: (current / maximum) * 100 };
    if (current >= maximum * 0.8)
      return { level: 'Well Stocked', color: 'green', percentage: (current / maximum) * 100 };
    return { level: 'Normal', color: 'blue', percentage: (current / maximum) * 100 };
  };

  // Statistics cards
  const statsCards = [
    {
      title: 'Total Items',
      value: 0 /* TODO: Fetch from API */,
      icon: IconPackage,
      color: 'blue',
      trend: '+5.2%',
    },
    {
      title: 'Low Stock Alerts',
      value: 0 /* TODO: Fetch from API */,
      icon: IconAlertCircle,
      color: 'orange',
      trend: '-12%',
    },
    {
      title: 'Total Value',
      value: formatCurrency(0 /* TODO: Fetch from API */),
      icon: IconCalculator,
      color: 'green',
      trend: '+8.7%',
    },
    {
      title: 'Equipment',
      value: 0 /* TODO: Fetch from API */,
      icon: IconStethoscope,
      color: 'purple',
      trend: '+3.1%',
    },
  ];

  // Chart data
  const categoryDistribution = [];

  const stockLevelsData = [];
  const monthlyConsumption = [];

  return (
    <Container size="xl" py={{ base: 'xs', sm: 'sm', md: 'md' }} px={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={1}>Inventory Management</Title>
          <Text c="dimmed" size="sm">
            Manage medical supplies, equipment, and procurement
          </Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddItem}>
            Add Item
          </Button>
          <Button
            variant="light"
            leftSection={<IconShoppingCart size={16} />}
            onClick={_openAddOrder}
          >
            New Order
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="lg">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} padding="lg" radius="md" withBorder>
              <Group justify="space-between">
                <div>
                  <Text c="dimmed" size="sm" fw={500}>
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                  <Icon size={24} />
                </ThemeIcon>
              </Group>
              <Group justify="space-between" mt="sm">
                <Badge
                  color={stat.trend.startsWith('+') ? 'green' : 'red'}
                  variant="light"
                  size="sm"
                >
                  {stat.trend}
                </Badge>
                <Text size="xs" c="dimmed">
                  vs last month
                </Text>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      {/* Alerts Section - Hidden until API data available */}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="items" leftSection={<IconPackage size={16} />}>
            Inventory Items
          </Tabs.Tab>
          <Tabs.Tab value="orders" leftSection={<IconShoppingCart size={16} />}>
            Purchase Orders
          </Tabs.Tab>
          <Tabs.Tab value="equipment" leftSection={<IconStethoscope size={16} />}>
            Equipment
          </Tabs.Tab>
          <Tabs.Tab value="reports" leftSection={<IconChartBar size={16} />}>
            Reports & Analytics
          </Tabs.Tab>
        </Tabs.List>

        {/* Inventory Items Tab */}
        <Tabs.Panel value="items">
          <Paper p="md" radius="md" withBorder mt="md">
            {/* Search and Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search items..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Category"
                data={[
                  { value: 'medication', label: 'Medication' },
                  { value: 'medical_supplies', label: 'Medical Supplies' },
                  { value: 'surgical_instruments', label: 'Surgical Instruments' },
                  { value: 'laboratory', label: 'Laboratory' },
                  { value: 'radiology', label: 'Radiology' },
                  { value: 'consumables', label: 'Consumables' },
                  { value: 'equipment', label: 'Equipment' },
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                clearable
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'in_stock', label: 'In Stock' },
                  { value: 'low_stock', label: 'Low Stock' },
                  { value: 'out_of_stock', label: 'Out of Stock' },
                  { value: 'expired', label: 'Expired' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
              <Select
                placeholder="Supplier"
                data={[].map(
                  /* TODO: Fetch from API */ (supplier) => ({
                    value: supplier.id,
                    label: (supplier as any).companyName || (supplier as any).name || 'Unknown',
                  })
                )}
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                clearable
              />
              <Button variant="light" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Group>

            {/* Items Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredItems.map((item) => {
                const stockInfo = getStockLevel(
                  item.currentStock,
                  item.minimumStock,
                  item.maximumStock
                );

                return (
                  <Card key={item.id} padding="lg" radius="md" withBorder>
                    <Group justify="space-between" mb="md">
                      <div style={{ flex: 1 }}>
                        <Group>
                          <ThemeIcon
                            color={getCategoryColor((item as any).category || item.category)}
                            variant="light"
                            size="lg"
                          >
                            <IconPackage size={20} />
                          </ThemeIcon>
                          <div>
                            <Text fw={600} size="sm" lineClamp={1}>
                              {(item as any).itemName || (item as any).name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {(item as any).itemCode || 'N/A'}
                            </Text>
                          </div>
                        </Group>
                      </div>
                      <Badge color={getStatusColor((item as any).status)} variant="light" size="sm">
                        {(item as any).status?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </Group>

                    <Stack gap="sm" mb="md">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Current Stock
                        </Text>
                        <Text size="sm" fw={600}>
                          {(item as any).currentStock || 0} {(item as any).unit || 'units'}
                        </Text>
                      </Group>

                      <div>
                        <Group justify="space-between" mb="xs">
                          <Text size="xs" c="dimmed">
                            Stock Level
                          </Text>
                          <Text size="xs" c={stockInfo.color} fw={500}>
                            {stockInfo.level}
                          </Text>
                        </Group>
                        <Progress value={stockInfo.percentage} color={stockInfo.color} size="sm" />
                      </div>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Unit Price
                        </Text>
                        <Text size="sm" fw={600}>
                          {formatCurrency((item as any).unitPrice || item.unitCost || 0)}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Total Value
                        </Text>
                        <Text size="sm" fw={600} c="green">
                          {formatCurrency(
                            (item as any).currentStock *
                              ((item as any).unitPrice || item.unitCost || 0)
                          )}
                        </Text>
                      </Group>

                      {(item as any).expiryDate && (
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Expiry Date
                          </Text>
                          <Text
                            size="sm"
                            c={new Date((item as any).expiryDate) < new Date() ? 'red' : 'dimmed'}
                          >
                            {new Date((item as any).expiryDate).toLocaleDateString()}
                          </Text>
                        </Group>
                      )}
                    </Stack>

                    <Group justify="space-between">
                      <Badge
                        color={getCategoryColor((item as any).category || item.category)}
                        variant="light"
                        size="xs"
                      >
                        {(item as any).category?.replace('_', ' ') || 'N/A'}
                      </Badge>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleViewItem(item as any)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="green">
                          <IconEdit size={16} />
                        </ActionIcon>
                        <Menu>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item leftSection={<IconClipboard size={14} />}>
                              Stock Adjustment
                            </Menu.Item>
                            <Menu.Item leftSection={<IconShoppingCart size={14} />}>
                              Reorder
                            </Menu.Item>
                            <Menu.Item leftSection={<IconDownload size={14} />}>
                              Export Data
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Group>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Purchase Orders Tab */}
        <Tabs.Panel value="orders">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Purchase Orders</Title>
              <Button leftSection={<IconPlus size={16} />} onClick={_openAddOrder}>
                Create Order
              </Button>
            </Group>

            {/* Order Filters */}
            <Group mb="md">
              <TextInput
                placeholder="Search orders..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'ordered', label: 'Ordered' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={selectedStatus}
                onChange={setSelectedStatus}
                clearable
              />
            </Group>

            {/* Orders Table */}
            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Order #</Table.Th>
                    <Table.Th>Supplier</Table.Th>
                    <Table.Th>Order Date</Table.Th>
                    <Table.Th>Expected Delivery</Table.Th>
                    <Table.Th>Items</Table.Th>
                    <Table.Th>Total Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredOrders.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={9}>
                        <EmptyState
                          icon={<IconPackage size={48} />}
                          title="No inventory items"
                          description="Add items to your inventory"
                          size="sm"
                        />
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <Table.Tr key={order.id}>
                        <Table.Td>
                          <Text fw={500}>{(order as any).orderNumber || order.id}</Text>
                        </Table.Td>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={500}>
                              {(order.supplier as any).companyName ||
                                (order.supplier as any).name ||
                                'Unknown'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {(order.supplier as any).contactPerson || 'N/A'}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{new Date(order.orderDate).toLocaleDateString()}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{order.items.length} items</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={600}>{formatCurrency(order.totalAmount)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(order.status)} variant="light">
                            {order.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewOrder(order)}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="green">
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange">
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </Tabs.Panel>

        {/* Equipment Tab */}
        <Tabs.Panel value="equipment">
          <Paper p="md" radius="md" withBorder mt="md">
            <Group justify="space-between" mb="lg">
              <Title order={3}>Medical Equipment</Title>
              <Button leftSection={<IconPlus size={16} />}>Add Equipment</Button>
            </Group>

            {/* Equipment Grid */}
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {filteredEquipment.map((equipment) => (
                <Card key={equipment.id} padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="md">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} size="lg" lineClamp={1}>
                        {(equipment as any).equipmentName || equipment.name}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {(equipment as any).manufacturer || 'Unknown'} -{' '}
                        {(equipment as any).model || 'N/A'}
                      </Text>
                    </div>
                    <Badge color={getStatusColor(equipment.status)} variant="light">
                      {equipment.status.replace('_', ' ')}
                    </Badge>
                  </Group>

                  <Stack gap="sm" mb="md">
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Serial Number
                      </Text>
                      <Text size="sm" fw={500}>
                        {(equipment as any).serialNumber || 'N/A'}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Location
                      </Text>
                      <Text size="sm">{equipment.location}</Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Purchase Date
                      </Text>
                      <Text size="sm">
                        {(equipment as any).purchaseDate
                          ? new Date((equipment as any).purchaseDate).toLocaleDateString()
                          : 'N/A'}
                      </Text>
                    </Group>

                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Warranty
                      </Text>
                      <Text
                        size="sm"
                        c={
                          (equipment as any).warrantyExpiry &&
                          new Date((equipment as any).warrantyExpiry) < new Date()
                            ? 'red'
                            : 'green'
                        }
                      >
                        {(equipment as any).warrantyExpiry
                          ? new Date((equipment as any).warrantyExpiry) < new Date()
                            ? 'Expired'
                            : 'Valid'
                          : 'N/A'}
                      </Text>
                    </Group>

                    {(equipment as any).nextMaintenanceDate && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Next Maintenance
                        </Text>
                        <Text
                          size="sm"
                          c={
                            new Date((equipment as any).nextMaintenanceDate) < new Date()
                              ? 'red'
                              : 'dimmed'
                          }
                        >
                          {new Date((equipment as any).nextMaintenanceDate).toLocaleDateString()}
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  <Group justify="space-between">
                    <Text size="sm" fw={600} c="blue">
                      {formatCurrency((equipment as any).purchasePrice || 0)}
                    </Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => _handleViewEquipment(equipment as any)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="green">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="orange">
                        <IconSettings size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>

        {/* Reports & Analytics Tab */}
        <Tabs.Panel value="reports">
          <Paper p="md" radius="md" withBorder mt="md">
            <Title order={3} mb="lg">
              Inventory Reports & Analytics
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
              {/* Category Distribution */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Items by Category
                </Title>
                <MantineDonutChart
                  data={categoryDistribution}
                  size={160}
                  thickness={30}
                  withLabels
                />
              </Card>

              {/* Stock Levels */}
              <Card padding="lg" radius="md" withBorder>
                <Title order={4} mb="md">
                  Stock Level Distribution
                </Title>
                <SimpleBarChart
                  h={200}
                  data={stockLevelsData}
                  dataKey="level"
                  series={[{ name: 'count', color: 'blue.6' }]}
                />
              </Card>

              {/* Monthly Consumption */}
              <Card padding="lg" radius="md" withBorder style={{ gridColumn: '1 / -1' }}>
                <Title order={4} mb="md">
                  Monthly Consumption Trends
                </Title>
                <SimpleLineChart
                  h={300}
                  data={monthlyConsumption}
                  dataKey="month"
                  series={[
                    { name: 'consumed', color: 'blue.6', label: 'Consumed' },
                    { name: 'restocked', color: 'green.6', label: 'Restocked' },
                  ]}
                />
              </Card>
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Add Item Modal */}
      <Modal opened={addItemOpened} onClose={closeAddItem} title="Add New Item" size="lg">
        <Stack gap="md">
          <SimpleGrid cols={2}>
            <TextInput label="Item Name" placeholder="Enter item name" required />
            <TextInput label="Item Code" placeholder="Enter item code" required />
          </SimpleGrid>

          <Select
            label="Category"
            placeholder="Select category"
            data={[
              { value: 'medication', label: 'Medication' },
              { value: 'medical_supplies', label: 'Medical Supplies' },
              { value: 'surgical_instruments', label: 'Surgical Instruments' },
              { value: 'laboratory', label: 'Laboratory' },
              { value: 'consumables', label: 'Consumables' },
            ]}
            required
          />

          <Textarea label="Description" placeholder="Enter item description" rows={3} />

          <SimpleGrid cols={3}>
            <NumberInput
              label="Unit Price"
              placeholder="Enter price"
              leftSection="₹"
              min={0}
              required
            />
            <NumberInput label="Minimum Stock" placeholder="Min stock level" min={0} required />
            <NumberInput label="Maximum Stock" placeholder="Max stock level" min={0} required />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput label="Unit" placeholder="e.g., pcs, mg, ml" required />
            <Select
              label="Supplier"
              placeholder="Select supplier"
              data={[].map(
                /* TODO: Fetch from API */ (supplier) => ({
                  value: supplier.id,
                  label: (supplier as any).companyName || (supplier as any).name || 'Unknown',
                })
              )}
            />
          </SimpleGrid>

          <DatePickerInput label="Expiry Date (Optional)" placeholder="Select expiry date" />

          <Group justify="flex-end">
            <Button variant="light" onClick={closeAddItem}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Item added successfully',
                  color: 'green',
                });
                closeAddItem();
              }}
            >
              Add Item
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Order Modal */}
      <Modal
        opened={_addOrderOpened}
        onClose={_closeAddOrder}
        title="Create Purchase Order"
        size="lg"
      >
        <Stack gap="md">
          <Select
            label="Supplier"
            placeholder="Select supplier"
            data={[].map(
              /* TODO: Fetch from API */ (supplier) => ({
                value: supplier.id,
                label: (supplier as any).companyName || (supplier as any).name || 'Unknown',
              })
            )}
            required
          />

          <DatePickerInput
            label="Expected Delivery Date"
            placeholder="Select delivery date"
            required
          />

          <Divider label="Order Items" labelPosition="center" />

          <SimpleGrid cols={3}>
            <Select
              label="Item"
              placeholder="Select item"
              data={[].map(
                /* TODO: Fetch from API */ (item) => ({
                  value: item.id,
                  label: (item as any).itemName || item.name,
                })
              )}
              required
            />
            <NumberInput label="Quantity" placeholder="Enter quantity" min={1} required />
            <NumberInput
              label="Unit Price"
              placeholder="Enter price"
              leftSection="₹"
              min={0}
              required
            />
          </SimpleGrid>

          <Button variant="light" leftSection={<IconPlus size={16} />}>
            Add More Items
          </Button>

          <Textarea label="Notes" placeholder="Additional notes..." rows={3} />

          <Group justify="flex-end">
            <Button variant="light" onClick={_closeAddOrder}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notifications.show({
                  title: 'Success',
                  message: 'Purchase order created successfully',
                  color: 'green',
                });
                _closeAddOrder();
              }}
            >
              Create Order
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default InventoryManagement;
