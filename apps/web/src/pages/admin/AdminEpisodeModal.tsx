import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { AdminEpisodeDto, EpisodeStatus } from '@movie/types';
import { useEffect } from 'react';
import { adminPatch, adminPost } from '../../api/adminClient';

type Props = {
  open: boolean;
  movieId: string;
  episode: AdminEpisodeDto | null;
  nextEpisodeNumber: number;
  onClose: () => void;
  onSaved: () => void;
};

export function AdminEpisodeModal({
  open,
  movieId,
  episode,
  nextEpisodeNumber,
  onClose,
  onSaved,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    if (episode) {
      form.setFieldsValue({
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        telegramFileId: episode.telegramFileId,
        durationSeconds: episode.durationSeconds,
        mimeType: episode.mimeType ?? 'video/mp4',
        status: episode.status,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        episodeNumber: nextEpisodeNumber,
        status: 'ACTIVE' as EpisodeStatus,
        mimeType: 'video/mp4',
      });
    }
  }, [open, episode, form, nextEpisodeNumber]);

  async function submit() {
    const values = await form.validateFields();
    try {
      if (episode) {
        await adminPatch(`/admin/episodes/${episode.id}`, values);
        message.success('Episode updated');
      } else {
        await adminPost('/admin/episodes', { ...values, movieId });
        message.success('Episode added');
      }
      onSaved();
      onClose();
    } catch {
      message.error('Could not save episode');
    }
  }

  return (
    <Modal
      title={episode ? 'Edit episode / video' : 'Add episode / video'}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="Save"
      width={560}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="episodeNumber" label="Episode #" rules={[{ required: true }]}>
          <InputNumber min={1} className="w-full" />
        </Form.Item>
        <Form.Item name="title" label="Title">
          <Input placeholder="Full movie / Episode 1" />
        </Form.Item>
        <Form.Item
          name="telegramFileId"
          label="Telegram file ID"
          rules={[{ required: true, min: 3 }]}
          extra="From channel forward + getUpdates. See docs/telegram-file-id.md"
        >
          <Input.TextArea rows={2} placeholder="BAACAgIAAxkB…" />
        </Form.Item>
        <Form.Item name="mimeType" label="MIME type">
          <Input placeholder="video/mp4" />
        </Form.Item>
        <Form.Item name="durationSeconds" label="Duration (seconds)">
          <InputNumber min={0} className="w-full" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'ACTIVE', label: 'Active (playable)' },
              { value: 'DRAFT', label: 'Draft' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
