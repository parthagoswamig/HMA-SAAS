-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  registration_number TEXT NOT NULL,
  title TEXT,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  blood_type TEXT,
  marital_status TEXT,
  registration_type TEXT NOT NULL,
  insurance_type TEXT,
  insurance_number TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  medical_history TEXT,
  allergies TEXT[],
  current_medications TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID,
  CONSTRAINT patients_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT emergency_contacts_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE
);

-- Create patient_documents table
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT patient_documents_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone_number ON public.patients(phone_number);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_registration_number ON public.patients(registration_number);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id ON public.emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_patient_id ON public.patient_documents(patient_id);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients
CREATE POLICY "Patients are viewable by authenticated users within the same tenant" 
ON public.patients FOR SELECT 
TO authenticated 
USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert their own patients" 
ON public.patients FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update their own patients" 
ON public.patients FOR UPDATE 
TO authenticated 
USING (auth.uid() = tenant_id);

-- Create RLS policies for emergency_contacts
CREATE POLICY "Emergency contacts are viewable by authenticated users within the same tenant" 
ON public.emergency_contacts FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND tenant_id = auth.uid()));

CREATE POLICY "Users can insert emergency contacts for their patients" 
ON public.emergency_contacts FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND tenant_id = auth.uid()));

-- Create RLS policies for patient_documents
CREATE POLICY "Patient documents are viewable by authenticated users within the same tenant" 
ON public.patient_documents FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND tenant_id = auth.uid()));

CREATE POLICY "Users can insert documents for their patients" 
ON public.patient_documents FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM public.patients WHERE id = patient_id AND tenant_id = auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE OR REPLACE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE TRIGGER update_patient_documents_updated_at
BEFORE UPDATE ON public.patient_documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
