import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from "sonner";
import { getVisitorByCpf, updateVisitor, createVisitor, createAccessLog, Visitor, AccessLog } from "../../lib/supabase-api";

const EntranceForm: React.FC = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [photo, setPhoto] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [reason, setReason] = useState('');

  const resetForm = () => {
    setName('');
    setCpf('');
    setPhoto('');
    setApartmentNumber('');
    setReason('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando processo de registro de entrada...");
      
      // Verificar se já existe um visitante com este CPF
      const { data: existingVisitors } = await getVisitorByCpf(cpf);
      console.log("Resultado da busca por CPF:", existingVisitors);
      
      let visitorId: string;
      let visitorData: Visitor | null = null;
      
      if (existingVisitors && existingVisitors.length > 0) {
        // Visitante existe, usar ID existente
        visitorData = existingVisitors[0];
        visitorId = visitorData.id;
        console.log("Visitante existente encontrado:", visitorId);
        
        // Atualizar foto se necessário
        if (photo && photo !== visitorData.photo) {
          console.log("Atualizando foto do visitante existente");
          const { error: updateError } = await updateVisitor(visitorId, { photo });
          if (updateError) {
            console.error("Erro ao atualizar foto:", updateError);
            toast.error("Erro ao atualizar foto do visitante");
          }
        }
      } else {
        // Criar novo visitante
        console.log("Criando novo visitante com dados:", { name, cpf, photo });
        
        // Garantir que temos um nome válido
        if (!name.trim()) {
          throw new Error("Nome do visitante é obrigatório");
        }
        
        const { data: newVisitor, error: createError } = await createVisitor({
          name,
          cpf,
          photo: photo || '',
        } as Visitor);
        
        console.log("Resposta da criação de visitante:", { newVisitor, createError });
        
        if (createError || !newVisitor || newVisitor.length === 0) {
          console.error("Erro na criação do visitante:", createError);
          throw new Error(createError?.message || "Falha ao criar visitante");
        }
        
        visitorData = newVisitor[0];
        visitorId = visitorData.id;
        console.log("Novo visitante criado com ID:", visitorId);
        
        if (!visitorId) {
          throw new Error("ID do visitante não foi gerado corretamente");
        }
      }
      
      // Criar registro de acesso
      console.log("Criando registro de acesso para visitante ID:", visitorId);
      const accessLog: AccessLog = {
        visitorId,
        going_to_ap: apartmentNumber,
        entrance_reason: reason,
        lastAccess: new Date().toISOString(),
      } as AccessLog;
      
      const { error: accessLogError } = await createAccessLog(accessLog);
      
      if (accessLogError) {
        console.error("Erro ao registrar acesso:", accessLogError);
        throw new Error(accessLogError.message || "Falha ao registrar acesso");
      }
      
      console.log("Acesso registrado com sucesso");
      toast.success("Entrada registrada com sucesso!");
      resetForm();
      router.push('/');
    } catch (error) {
      console.error("Erro durante o processo de registro:", error);
      toast.error(`Erro: ${error.message || "Falha ao processar o registro"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium">CPF</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="apartment" className="block text-sm font-medium">Apartamento</label>
          <input
            type="text"
            id="apartment"
            value={apartmentNumber}
            onChange={(e) => setApartmentNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="reason" className="block text-sm font-medium">Motivo</label>
          <input
            type="text"
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        
        <div>
          <label htmlFor="photo" className="block text-sm font-medium">URL da Foto</label>
          <input
            type="text"
            id="photo"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Registrar Entrada"}
        </button>
      </div>
    </form>
  );
};

export default EntranceForm; 