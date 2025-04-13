import React, { FormEvent } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { getVisitorByCPF, updateVisitor, createVisitor, createAccessLog } from '../services/api';
import { AccessLog, Visitor } from '../types';

const EntranceForm: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando processo de registro de entrada...");
      
      // Verificar se já existe um visitante com este CPF
      const { data: existingVisitors } = await getVisitorByCPF(cpf);
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
    <form onSubmit={handleSubmit}>
      {/* Form fields go here */}
    </form>
  );
};

export default EntranceForm; 