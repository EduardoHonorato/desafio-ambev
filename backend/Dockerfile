FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["EmployeeManagement.API/EmployeeManagement.API.csproj", "EmployeeManagement.API/"]
COPY ["EmployeeManagement.Application/EmployeeManagement.Application.csproj", "EmployeeManagement.Application/"]
COPY ["EmployeeManagement.Domain/EmployeeManagement.Domain.csproj", "EmployeeManagement.Domain/"]
COPY ["EmployeeManagement.Infrastructure/EmployeeManagement.Infrastructure.csproj", "EmployeeManagement.Infrastructure/"]
RUN dotnet restore "EmployeeManagement.API/EmployeeManagement.API.csproj"
COPY . .
WORKDIR "/src/EmployeeManagement.API"
RUN dotnet build "EmployeeManagement.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "EmployeeManagement.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EmployeeManagement.API.dll"]
