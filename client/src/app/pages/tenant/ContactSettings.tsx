import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { PageHeader } from '@/app/components/shared/PageHeader'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { MapPin } from 'lucide-react'

interface ContactInfo {
  address: string
  phone: string
  mobile: string
  email: string
  mapEmbedUrl: string
  facebook: string
  instagram: string
  youtube: string
  whatsapp: string
  telegram: string
}

const emptyContact: ContactInfo = {
  address: '',
  phone: '',
  mobile: '',
  email: '',
  mapEmbedUrl: '',
  facebook: '',
  instagram: '',
  youtube: '',
  whatsapp: '',
  telegram: '',
}

export function ContactSettings() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ContactInfo>(emptyContact)

  const { data, isLoading } = useQuery<ContactInfo>({
    queryKey: ['tenant', 'contact-settings'],
    queryFn: () => api('/api/tenant/contact'),
  })

  useEffect(() => {
    if (data) {
      setForm({
        address: data.address ?? '',
        phone: data.phone ?? '',
        mobile: data.mobile ?? '',
        email: data.email ?? '',
        mapEmbedUrl: data.mapEmbedUrl ?? '',
        facebook: data.facebook ?? '',
        instagram: data.instagram ?? '',
        youtube: data.youtube ?? '',
        whatsapp: data.whatsapp ?? '',
        telegram: data.telegram ?? '',
      })
    }
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (contact: ContactInfo) =>
      api('/api/tenant/contact', {
        method: 'PUT',
        body: contact,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'contact-settings'] })
      toast.success('Contact info saved')
    },
    onError: () => toast.error('Failed to save contact info'),
  })

  function handleSave() {
    saveMutation.mutate(form)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Contact Info"
        subtitle="Manage your business contact details and social links"
        breadcrumbs={[{ label: 'Overview', href: '/' }, { label: 'Contact Info' }]}
        actions={
          <Button onClick={handleSave} size="sm" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-6 max-w-2xl">
        {/* Contact Details */}
        <div className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Contact Details</h2>

          <div className="space-y-1.5">
            <Label htmlFor="ci-address">Address</Label>
            <Input
              id="ci-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Main St, City, Country"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ci-phone">Phone</Label>
              <Input
                id="ci-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ci-mobile">Mobile</Label>
              <Input
                id="ci-mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="+1 (555) 000-0001"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ci-email">Email</Label>
            <Input
              id="ci-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@yourcompany.com"
            />
          </div>
        </div>

        {/* Map Embed */}
        <div className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Map</h2>

          <div className="space-y-1.5">
            <Label htmlFor="ci-map">Google Maps Embed URL</Label>
            <Input
              id="ci-map"
              value={form.mapEmbedUrl}
              onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
            <p className="text-xs text-gray-400">Paste the src URL from the Google Maps embed iframe</p>
          </div>

          {form.mapEmbedUrl && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <iframe
                src={form.mapEmbedUrl}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map preview"
              />
            </div>
          )}

          {!form.mapEmbedUrl && (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 h-[200px]">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-xs text-gray-400">Map preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Social & Messaging</h2>

          <div className="space-y-1.5">
            <Label htmlFor="ci-facebook">Facebook URL</Label>
            <Input
              id="ci-facebook"
              value={form.facebook}
              onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ci-instagram">Instagram URL</Label>
            <Input
              id="ci-instagram"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ci-youtube">YouTube URL</Label>
            <Input
              id="ci-youtube"
              value={form.youtube}
              onChange={(e) => setForm({ ...form, youtube: e.target.value })}
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ci-whatsapp">WhatsApp Number</Label>
              <Input
                id="ci-whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+15550000000"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ci-telegram">Telegram Username</Label>
              <Input
                id="ci-telegram"
                value={form.telegram}
                onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                placeholder="@yourusername"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
