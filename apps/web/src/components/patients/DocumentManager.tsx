'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  Textarea,
  Select,
  Button,
  Paper,
  Badge,
  ActionIcon,
  Grid,
  Alert,
  Tabs,
  Menu,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import { DatePickerInput } from '@mantine/dates';
import {
  IconFileText,
  IconUpload,
  IconEye,
  IconDownload,
  IconEdit,
  IconTrash,
  IconShare,
  IconFileUpload,
  IconCalendar,
  IconDeviceFloppy,
  IconX,
  IconPhoto,
  IconSearch,
  IconFileWord,
  IconFile,
  IconLock,
  IconShield,
  IconWorld,
  IconSortAscending,
  IconDotsVertical,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PatientDocument } from '../../types/patient';
import { formatDate } from '../../lib/utils';

interface DocumentManagerProps {
  opened: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  documents: PatientDocument[];
  onUpload: (document: Partial<PatientDocument>, file: File) => Promise<void>;
  onUpdate: (id: string, document: Partial<PatientDocument>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownload: (document: PatientDocument) => Promise<void>;
  onView: (document: PatientDocument) => Promise<void>;
}

interface DocumentFormData {
  documentType:
    | 'id_proof'
    | 'medical_report'
    | 'lab_result'
    | 'radiology'
    | 'prescription'
    | 'insurance'
    | 'consent'
    | 'discharge_summary'
    | 'vaccination_record'
    | 'other';
  title: string;
  description?: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
  tags?: string[];
  expirationDate?: Date;
}

const documentTypes = [
  { value: 'id_proof', label: 'ID Proof', color: 'blue' },
  { value: 'medical_report', label: 'Medical Report', color: 'green' },
  { value: 'lab_result', label: 'Lab Result', color: 'orange' },
  { value: 'radiology', label: 'Radiology', color: 'purple' },
  { value: 'prescription', label: 'Prescription', color: 'pink' },
  { value: 'insurance', label: 'Insurance', color: 'teal' },
  { value: 'consent', label: 'Consent Form', color: 'red' },
  { value: 'discharge_summary', label: 'Discharge Summary', color: 'cyan' },
  { value: 'vaccination_record', label: 'Vaccination Record', color: 'lime' },
  { value: 'other', label: 'Other', color: 'gray' },
];

export default function DocumentManager({
  opened,
  onClose,
  patientId,
  patientName,
  documents,
  onUpload,
  onUpdate,
  onDelete,
  onDownload,
  onView,
}: DocumentManagerProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [uploadModalOpened, setUploadModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'type' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const uploadForm = useForm<DocumentFormData>({
    initialValues: {
      documentType: 'other',
      title: '',
      description: '',
      accessLevel: 'restricted',
      tags: [],
      expirationDate: undefined,
    },
    validate: {
      title: (value) => (value.trim().length < 2 ? 'Title must be at least 2 characters' : null),
      documentType: (value) => (!value ? 'Document type is required' : null),
    },
  });

  const editForm = useForm<DocumentFormData>({
    initialValues: {
      documentType: 'other',
      title: '',
      description: '',
      accessLevel: 'restricted',
      tags: [],
      expirationDate: undefined,
    },
  });

  const handleUpload = async (values: DocumentFormData) => {
    if (selectedFiles.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Please select at least one file to upload.',
        color: 'red',
      });
      return;
    }

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        const documentData = {
          ...values,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
          uploadedBy: 'current_user', // Would come from auth context
          isActive: true,
          patientId,
        };

        await onUpload(documentData, file);
      }

      notifications.show({
        title: 'Upload Successful',
        message: `${selectedFiles.length} document(s) uploaded successfully.`,
        color: 'green',
      });

      handleUploadModalClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Upload Failed',
        message: 'Failed to upload documents. Please try again.',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (values: DocumentFormData) => {
    if (!editingDocument) return;

    try {
      await onUpdate(editingDocument.id, values);
      notifications.show({
        title: 'Document Updated',
        message: 'Document information has been updated successfully.',
        color: 'green',
      });
      handleEditModalClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      notifications.show({
        title: 'Update Failed',
        message: 'Failed to update document. Please try again.',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await onDelete(id);
        notifications.show({
          title: 'Document Deleted',
          message: 'Document has been deleted successfully.',
          color: 'green',
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        notifications.show({
          title: 'Delete Failed',
          message: 'Failed to delete document. Please try again.',
          color: 'red',
        });
      }
    }
  };

  const handleUploadModalClose = () => {
    uploadForm.reset();
    setSelectedFiles([]);
    setUploadModalOpened(false);
  };

  const handleEditModalClose = () => {
    editForm.reset();
    setEditingDocument(null);
    setEditModalOpened(false);
  };

  const openEditModal = (document: PatientDocument) => {
    setEditingDocument(document);
    editForm.setValues({
      documentType: document.documentType,
      title: document.title,
      description: document.description || '',
      accessLevel: document.accessLevel,
      tags: document.tags || [],
      expirationDate: document.expirationDate ? new Date(document.expirationDate) : undefined,
    });
    setEditModalOpened(true);
  };

  const getFileIcon = (mimeType: string, size = '1.5rem') => {
    if (mimeType.startsWith('image/')) {
      return <IconPhoto size={size} />;
    } else if (mimeType === 'application/pdf') {
      return <IconFileText size={size} />;
    } else if (mimeType.includes('word')) {
      return <IconFileWord size={size} />;
    } else {
      return <IconFile size={size} />;
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'public':
        return <IconWorld size="1rem" />;
      case 'restricted':
        return <IconShield size="1rem" />;
      case 'confidential':
        return <IconLock size="1rem" />;
      default:
        return <IconShield size="1rem" />;
    }
  };

  const getAccessColor = (level: string) => {
    switch (level) {
      case 'public':
        return 'green';
      case 'restricted':
        return 'blue';
      case 'confidential':
        return 'red';
      default:
        return 'gray';
    }
  };

  const filterAndSortDocuments = (docs: PatientDocument[]) => {
    let filtered = docs;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((doc) => doc.documentType === activeTab);
    }

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
          break;
        case 'type':
          comparison = a.documentType.localeCompare(b.documentType);
          break;
        case 'size':
          comparison = b.fileSize - a.fileSize;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getDocumentTypeStats = () => {
    const stats = documentTypes.map((type) => ({
      ...type,
      count: documents.filter((doc) => doc.documentType === type.value).length,
    }));
    return [
      { value: 'all', label: 'All Documents', count: documents.length, color: 'gray' },
      ...stats.filter((stat) => stat.count > 0),
    ];
  };

  const DocumentCard = ({ document }: { document: PatientDocument }) => (
    <Paper p="md" withBorder>
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group>
          <ThemeIcon
            size="lg"
            variant="light"
            color={documentTypes.find((t) => t.value === document.documentType)?.color || 'gray'}
          >
            {getFileIcon(document.mimeType)}
          </ThemeIcon>
          <div>
            <Text fw={500} size="sm">
              {document.title}
            </Text>
            <Text size="xs" c="dimmed">
              {document.documentType.replace('_', ' ')}
            </Text>
          </div>
        </Group>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="sm">
              <IconDotsVertical size="0.8rem" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconEye size="0.9rem" />} onClick={() => onView(document)}>
              View
            </Menu.Item>
            <Menu.Item
              leftSection={<IconDownload size="0.9rem" />}
              onClick={() => onDownload(document)}
            >
              Download
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size="0.9rem" />}
              onClick={() => openEditModal(document)}
            >
              Edit
            </Menu.Item>
            <Menu.Item leftSection={<IconShare size="0.9rem" />}>Share</Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size="0.9rem" />}
              onClick={() => handleDelete(document.id, document.title)}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {document.description && (
        <Text size="sm" c="dimmed" mb="sm">
          {document.description}
        </Text>
      )}

      <Group justify="space-between" align="center" mb="sm">
        <Badge
          color={getAccessColor(document.accessLevel)}
          variant="light"
          size="sm"
          leftSection={getAccessIcon(document.accessLevel)}
        >
          {document.accessLevel}
        </Badge>
        <Text size="xs" c="dimmed">
          {(document.fileSize / 1024).toFixed(1)} KB
        </Text>
      </Group>

      {document.tags && document.tags.length > 0 && (
        <Group gap="xs" mb="sm">
          {document.tags.map((tag, index) => (
            <Badge key={index} size="xs" variant="outline">
              {tag}
            </Badge>
          ))}
        </Group>
      )}

      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {formatDate(document.uploadedAt)}
        </Text>
        <Text size="xs" c="dimmed">
          By {document.uploadedBy}
        </Text>
      </Group>

      {document.expirationDate && (
        <Alert color="orange" mt="sm" p="xs">
          <Text size="xs">Expires: {formatDate(document.expirationDate)}</Text>
        </Alert>
      )}
    </Paper>
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconFileText size="1.2rem" />
            <div>
              <Text fw={600}>Document Manager</Text>
              <Text size="sm" c="dimmed">
                {patientName}
              </Text>
            </div>
          </Group>
        }
        size="xl"
      >
        <Stack gap="lg">
          {/* Header Controls */}
          <Group justify="space-between">
            <Group>
              <TextInput
                placeholder="Search documents..."
                leftSection={<IconSearch size="1rem" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ width: 250 }}
              />
              <Select
                placeholder="Sort by"
                leftSection={<IconSortAscending size="1rem" />}
                data={[
                  { value: 'date', label: 'Upload Date' },
                  { value: 'title', label: 'Title' },
                  { value: 'type', label: 'Type' },
                  { value: 'size', label: 'File Size' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as any)}
                style={{ width: 150 }}
              />
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </Group>

            <Button
              leftSection={<IconUpload size="1rem" />}
              onClick={() => setUploadModalOpened(true)}
            >
              Upload Document
            </Button>
          </Group>

          {/* Document Type Tabs */}
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'all')}>
            <Tabs.List>
              {getDocumentTypeStats().map((stat) => (
                <Tabs.Tab key={stat.value} value={stat.value}>
                  {stat.label} ({stat.count})
                </Tabs.Tab>
              ))}
            </Tabs.List>

            <Tabs.Panel value={activeTab} pt="md">
              {filterAndSortDocuments(documents).length === 0 ? (
                <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
                  <IconFileText size="3rem" color="var(--mantine-color-gray-5)" />
                  <Text mt="md" c="dimmed">
                    {searchQuery.trim() ? 'No documents match your search' : 'No documents found'}
                  </Text>
                </Paper>
              ) : (
                <Grid>
                  {filterAndSortDocuments(documents).map((document) => (
                    <Grid.Col key={document.id} span={{ base: 12, md: 6, lg: 4 }}>
                      <DocumentCard document={document} />
                    </Grid.Col>
                  ))}
                </Grid>
              )}
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Modal>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpened}
        onClose={handleUploadModalClose}
        title={
          <Group>
            <IconUpload size="1.2rem" />
            <Text fw={600}>Upload Documents</Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={uploadForm.onSubmit(handleUpload)}>
          <Stack gap="md">
            <Dropzone
              onDrop={setSelectedFiles}
              accept={[
                ...IMAGE_MIME_TYPE,
                ...PDF_MIME_TYPE,
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              ]}
              maxSize={10 * 1024 * 1024} // 10MB
              multiple
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload size="3.2rem" stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size="3.2rem" stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconFileUpload size="3.2rem" stroke={1.5} />
                </Dropzone.Idle>

                <div>
                  <Text size="xl" inline>
                    Drag files here or click to select files
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Attach up to 5 files, each file should not exceed 10MB
                  </Text>
                </div>
              </Group>
            </Dropzone>

            {selectedFiles.length > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Selected Files:
                </Text>
                {selectedFiles.map((file, index) => (
                  <Group
                    key={index}
                    justify="space-between"
                    p="xs"
                    bg="gray.0"
                    style={{ borderRadius: 4 }}
                  >
                    <Group>
                      {getFileIcon(file.type, '1rem')}
                      <div>
                        <Text size="sm" fw={500}>
                          {file.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {(file.size / 1024).toFixed(1)} KB
                        </Text>
                      </div>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() =>
                        setSelectedFiles((files) => files.filter((_, i) => i !== index))
                      }
                    >
                      <IconX size="0.8rem" />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Document Type"
                  placeholder="Select document type"
                  required
                  data={documentTypes.map((type) => ({ value: type.value, label: type.label }))}
                  {...uploadForm.getInputProps('documentType')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Access Level"
                  placeholder="Select access level"
                  required
                  data={[
                    { value: 'public', label: 'Public - Everyone can view' },
                    { value: 'restricted', label: 'Restricted - Healthcare staff only' },
                    { value: 'confidential', label: 'Confidential - Authorized personnel only' },
                  ]}
                  {...uploadForm.getInputProps('accessLevel')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Document Title"
              placeholder="Enter document title"
              required
              {...uploadForm.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Enter document description"
              minRows={2}
              {...uploadForm.getInputProps('description')}
            />

            <DatePickerInput
              label="Expiration Date"
              placeholder="Select expiration date (optional)"
              minDate={new Date()}
              {...uploadForm.getInputProps('expirationDate')}
              leftSection={<IconCalendar size="1rem" />}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={handleUploadModalClose} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" loading={uploading} leftSection={<IconUpload size="1rem" />}>
                Upload Documents
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={handleEditModalClose}
        title={
          <Group>
            <IconEdit size="1.2rem" />
            <Text fw={600}>Edit Document</Text>
          </Group>
        }
        size="lg"
      >
        <form onSubmit={editForm.onSubmit(handleEdit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Document Type"
                  placeholder="Select document type"
                  required
                  data={documentTypes.map((type) => ({ value: type.value, label: type.label }))}
                  {...editForm.getInputProps('documentType')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Access Level"
                  placeholder="Select access level"
                  required
                  data={[
                    { value: 'public', label: 'Public - Everyone can view' },
                    { value: 'restricted', label: 'Restricted - Healthcare staff only' },
                    { value: 'confidential', label: 'Confidential - Authorized personnel only' },
                  ]}
                  {...editForm.getInputProps('accessLevel')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Document Title"
              placeholder="Enter document title"
              required
              {...editForm.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Enter document description"
              minRows={2}
              {...editForm.getInputProps('description')}
            />

            <DatePickerInput
              label="Expiration Date"
              placeholder="Select expiration date (optional)"
              minDate={new Date()}
              {...editForm.getInputProps('expirationDate')}
              leftSection={<IconCalendar size="1rem" />}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={handleEditModalClose}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconDeviceFloppy size="1rem" />}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
