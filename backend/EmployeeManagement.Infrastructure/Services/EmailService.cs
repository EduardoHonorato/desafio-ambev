using EmployeeManagement.Domain.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace EmployeeManagement.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Envia email com código OTP para verificação de login
    /// </summary>
    /// <param name="email">Email do destinatário</param>
    /// <param name="code">Código OTP de 6 dígitos</param>
    /// <param name="firstName">Primeiro nome do colaborador</param>
    /// <param name="lastName">Sobrenome do colaborador</param>
    public async Task SendOtpEmailAsync(string email, string code, string firstName, string lastName)
    {
        var smtpHost = _configuration["Smtp:Host"] ?? "localhost";
        var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "1025");
        var fromEmail = _configuration["Smtp:FromEmail"] ?? "noreply@ambev.com";
        var fromName = _configuration["Smtp:FromName"] ?? "Ambev";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(new MailboxAddress("", email));
        message.Subject = "Código de Verificação - Ambev";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Código de Verificação - Ambev</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f5f5f5; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background-color: #1a1a1a; padding: 20px; text-align: center;"">
                            <img src=""https://www.ayraconsultoria.com.br/wp-content/uploads/2024/03/Ambev-logo-1024x395.webp"" alt=""Ambev Logo"" style=""max-width: 200px; height: auto;"" />
                            <p style=""color: #ffffff; margin: 10px 0 0 0; font-size: 14px;"">Sistema de Gestão de Colaboradores</p>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style=""padding: 30px 30px 20px 30px;"">
                            <h1 style=""color: #1a1a1a; font-size: 24px; margin: 0 0 10px 0;"">Olá, {firstName} {lastName}!</h1>
                            <p style=""color: #666666; font-size: 16px; line-height: 1.6; margin: 0;"">
                                Recebemos uma solicitação de acesso ao sistema Ambev. Para continuar com seu login de forma segura, utilize o código de verificação abaixo:
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Verification Code Section -->
                    <tr>
                        <td style=""padding: 0 30px 20px 30px;"">
                            <div style=""background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; text-align: center;"">
                                <p style=""color: #1a1a1a; font-size: 14px; font-weight: bold; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px;"">Seu Código de Verificação</p>
                                <div style=""background-color: #ffffff; border: 2px solid #1a1a1a; border-radius: 8px; padding: 20px; display: inline-block; margin: 0 auto;"">
                                    <h2 style=""color: #1a1a1a; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;"">{code}</h2>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Important Information -->
                    <tr>
                        <td style=""padding: 0 30px 20px 30px;"">
                            <!-- Box 1: Código expira em 10 minutos -->
                            <div style=""background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px;"">
                                <table cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                    <tr>
                                        <td style=""padding-right: 10px; vertical-align: top;"">
                                            <span style=""font-size: 20px;"">⏰</span>
                                        </td>
                                        <td>
                                            <p style=""color: #1a1a1a; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;"">Código expira em 10 minutos</p>
                                            <p style=""color: #666666; font-size: 14px; margin: 0; line-height: 1.5;"">Digite este código na tela de verificação para acessar sua conta.</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Box 2: Mantenha seu código seguro -->
                            <div style=""background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;"">
                                <table cellpadding=""0"" cellspacing=""0"" width=""100%"">
                                    <tr>
                                        <td style=""padding-right: 10px; vertical-align: top;"">
                                            <span style=""font-size: 20px;"">⚠️</span>
                                        </td>
                                        <td>
                                            <p style=""color: #1a1a1a; font-size: 14px; margin: 0 0 5px 0; font-weight: bold;"">Mantenha seu código seguro</p>
                                            <p style=""color: #666666; font-size: 14px; margin: 0; line-height: 1.5;"">Nunca compartilhe este código com terceiros. Se você não solicitou este acesso, ignore este e-mail.</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style=""padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0; text-align: center;"">
                            <p style=""color: #666666; font-size: 14px; margin: 0 0 15px 0;"">Precisa de ajuda? Entre em contato com nosso suporte:</p>
                            <table cellpadding=""0"" cellspacing=""0"" style=""margin: 0 auto 20px auto;"">
                                <tr>
                                    <td style=""padding-right: 10px;"">
                                        <a href=""mailto:suporte@ambev.com"" style=""display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 12px; font-size: 14px; vertical-align: middle;"">
                                            <img src=""https://cdn-icons-png.flaticon.com/512/10109/10109826.png"" alt=""Email"" style=""width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"" />
                                            suporte@ambev.com
                                        </a>
                                    </td>
                                    <td>
                                        <a href=""https://wa.me/5511999999999"" style=""display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 12px; font-size: 14px; vertical-align: middle;"">
                                            <img src=""https://www.sesduem.com.br/wp-content/uploads/2018/01/whatsapp-official-logo-png-download.png"" alt=""WhatsApp"" style=""width: 20px; height: 20px; vertical-align: middle; margin-right: 8px;"" />
                                            WhatsApp
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding=""0"" cellspacing=""0"" style=""margin: 0 auto 20px auto;"">
                                <tr>
                                    <td style=""padding: 0 10px;"">
                                        <a href=""https://www.linkedin.com/company/ambev"" style=""display: inline-block; width: 40px; height: 40px; background-color: #6c757d; border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none; vertical-align: middle;"">
                                            <img src=""https://cdn.iconscout.com/icon/free/png-256/free-linkedin-logo-icon-svg-download-png-1524231.png?f=webp"" alt=""LinkedIn"" style=""width: 24px; height: 24px; vertical-align: middle;"" />
                                        </a>
                                    </td>
                                    <td style=""padding: 0 10px;"">
                                        <a href=""https://www.instagram.com/ambev"" style=""display: inline-block; width: 40px; height: 40px; background-color: #6c757d; border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none; vertical-align: middle;"">
                                            <img src=""https://icones.pro/wp-content/uploads/2021/02/instagram-icone-noir.png"" alt=""Instagram"" style=""width: 24px; height: 24px; vertical-align: middle;"" />
                                        </a>
                                    </td>
                                    <td style=""padding: 0 10px;"">
                                        <a href=""https://twitter.com/ambev"" style=""display: inline-block; width: 40px; height: 40px; background-color: #6c757d; border-radius: 50%; text-align: center; line-height: 40px; text-decoration: none; vertical-align: middle;"">
                                            <img src=""https://cdn-icons-png.flaticon.com/512/733/733635.png"" alt=""Twitter"" style=""width: 24px; height: 24px; vertical-align: middle;"" />
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style=""color: #666666; font-size: 12px; margin: 0 0 10px 0;"">© 2025 Ambev. Todos os direitos reservados.</p>
                            <p style=""color: #666666; font-size: 12px; margin: 0;"">Este e-mail foi enviado para {email}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            "
        };

        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.None);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}

