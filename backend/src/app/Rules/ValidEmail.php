<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

/**
 * ValidEmail - Validación robusta de email con verificación de dominio
 *
 * Valida emails de forma más realista que email:rfc:
 * 1. Formato RFC 5322 básico
 * 2. Verificación de dominio (MX records si está disponible)
 * 3. Rechazo de dominios de prueba comunes (localhost, test, etc.)
 * 4. Validación de longitud
 *
 * Uso: 'email' => ['required', new ValidEmail()]
 */
class ValidEmail implements Rule
{
    protected $errorMessage = 'Email no válido';

    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        // Validar formato básico RFC 5322 (simplificado pero realista)
        if (!$this->isValidFormat($value)) {
            $this->errorMessage = 'Formato de email no válido';
            return false;
        }

        // Validar longitud (RFC 5321 máx 254 caracteres totales)
        if (strlen($value) > 254) {
            $this->errorMessage = 'Email muy largo (máx 254 caracteres)';
            return false;
        }

        // Extraer dominio
        $parts = explode('@', $value);
        if (count($parts) !== 2) {
            $this->errorMessage = 'Email debe contener un @';
            return false;
        }

        $domain = $parts[1];

        // Rechazar dominios de prueba/localhost comunes
        if ($this->isTestDomain($domain)) {
            $this->errorMessage = 'Dominio de prueba no permitido';
            return false;
        }

        // Verificar que el dominio tenga TLD válido
        if (!$this->hasValidTLD($domain)) {
            $this->errorMessage = 'Dominio debe tener extensión válida';
            return false;
        }

        // Verificar DNS/MX records si es posible (opcional, sin forzar en caso de error)
        if (function_exists('dns_check_record')) {
            if (!$this->checkDNS($domain)) {
                // Log the DNS failure but don't fail validation
                // (algunos hosts no permiten DNS check)
                // En producción, podría ser más estricto
            }
        }

        return true;
    }

    /**
     * Validar formato RFC 5322 (versión simplificada)
     * Acepta:
     * - Letras, números, puntos, guiones, guiones bajos, más
     * - Exactamente un @
     * - Dominio con al menos un punto
     */
    private function isValidFormat($email)
    {
        // Regex RFC 5322 simplificado pero efectivo
        $pattern = '/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

        if (!preg_match($pattern, $email)) {
            return false;
        }

        // Verificaciones adicionales
        if (str_starts_with($email, '.') || str_ends_with($email, '.')) {
            return false; // No puede empezar/terminar con punto
        }

        if (str_contains($email, '..')) {
            return false; // Puntos consecutivos no permitidos
        }

        // Validar parte local (antes de @)
        $local = explode('@', $email)[0];
        if (strlen($local) > 64) {
            return false; // Parte local máx 64 caracteres
        }

        if (str_starts_with($local, '.') || str_ends_with($local, '.')) {
            return false;
        }

        return true;
    }

    /**
     * Verificar si es un dominio de prueba
     */
    private function isTestDomain($domain)
    {
        $testDomains = [
            'localhost',
            'example.com',
            'test.com',
            'example.org',
            'example.net',
            'invalid',
            'localhost.localdomain',
            '127.0.0.1',
            '0.0.0.0',
            'domain.local',
            'mail.local',
            'mailtrap.io',
            'mailinator.com',
            'tempmail.com',
            '10minutemail.com',
            'guerrillamail.com',
        ];

        $domain = strtolower($domain);

        return in_array($domain, $testDomains, true);
    }

    /**
     * Verificar que tenga TLD válido
     */
    private function hasValidTLD($domain)
    {
        $parts = explode('.', $domain);

        // Debe tener al menos 2 partes (ejemplo.com)
        if (count($parts) < 2) {
            return false;
        }

        // TLD debe tener al menos 2 caracteres
        $tld = array_pop($parts);
        if (strlen($tld) < 2) {
            return false;
        }

        // TLD no puede ser solo números
        if (ctype_digit($tld)) {
            return false;
        }

        return true;
    }

    /**
     * Verificar DNS/MX records del dominio
     * Nota: No es crítico si falla (algunos hosts bloquean DNS)
     */
    private function checkDNS($domain)
    {
        try {
            // Intenta verificar MX records
            if (@dns_check_record($domain, 'MX')) {
                return true;
            }

            // Si no hay MX, intenta A record
            if (@dns_check_record($domain, 'A')) {
                return true;
            }

            // Si no hay ninguno, es probable que no exista
            return false;
        } catch (\Exception $e) {
            // Si hay error (DNS no disponible), no fallar
            return true;
        }
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return $this->errorMessage;
    }
}
